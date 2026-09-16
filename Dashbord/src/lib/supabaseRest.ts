type SupabaseRows<T> = {
  rows: T[];
  count: number | null;
};

/**
 * Read data over Supabase's HTTPS API when a local machine cannot reach the
 * direct PostgreSQL endpoint (which is commonly IPv6-only on port 5432).
 * The API uses the project's public anon key and remains subject to Supabase
 * RLS policies.
 */
export async function getSupabaseRows<T>(
  table: string,
  query: Record<string, string> = {},
): Promise<SupabaseRows<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error('Supabase REST credentials are not configured.');
  }

  const url = new URL(`/rest/v1/${table}`, baseUrl);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Prefer: 'count=exact',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase REST ${response.status}: ${message.slice(0, 300)}`);
  }

  const contentRange = response.headers.get('content-range');
  const total = contentRange?.split('/')[1];
  return {
    rows: await response.json() as T[],
    count: total && total !== '*' ? Number(total) : null,
  };
}
