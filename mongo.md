# MongoDB migration guide

This repository currently uses one Prisma/PostgreSQL database shared by `dodshop` and `Dashbord`. This guide moves that database to MongoDB without changing the API layer (`prisma.product.findMany()`, `prisma.order.create()`, etc.).

> Do not point the application at MongoDB until the data copy has been verified. Keep the PostgreSQL database available until the production smoke tests pass.

## What changes

| Area | Current | MongoDB target |
| --- | --- | --- |
| Prisma datasource | `postgresql` | `mongodb` |
| Connection string | `postgresql://...` | MongoDB Atlas `mongodb+srv://...` |
| Schema deployment | `prisma migrate ...` | `prisma db push` |
| IDs during this migration | UUID strings | Keep the same UUID strings, mapped to Mongo `_id` |
| Referential deletes | Database cascades | Explicit application cleanup / MongoDB transactions |

Keeping the current UUID IDs is intentional: it preserves every relation in the existing data (customer, product, order, cart, wishlist, and return references). Do **not** convert existing UUIDs to `ObjectId` as part of the first migration.

## 1. Create the MongoDB database

1. Create a MongoDB Atlas cluster and database, for example `dodshop`.
2. Create a least-privilege application user with read/write access to that database.
3. In Atlas Network Access, allow only the production host(s) and the developer IPs that need access.
4. Use an Atlas cluster or another MongoDB deployment configured as a **replica set**. Prisma needs this because the application uses transactions.

Add the URI locally and in each deployment environment; never commit it:

```env
DATABASE_URL="mongodb+srv://APP_USER:URL_ENCODED_PASSWORD@CLUSTER/dodshop?retryWrites=true&w=majority"
```

Use a URL-encoded password. `@`, `:`, `/`, and similar characters cannot be placed unescaped in the URI.

Update [`.env.example`](.env.example) to show a MongoDB placeholder after the migration is complete.

## 2. Back up and audit the PostgreSQL data

Take a PostgreSQL backup before changing the schema. Also record document counts for all models. The current schema has these collections:

`AdminUser`, `Category`, `Collection`, `Product`, `Customer`, `OldCustomer`, `Address`, `CartItem`, `WishlistItem`, `Order`, `OrderItem`, `InventoryLog`, `ReturnRequest`, `ContactForm`, `CMSConfig`, `Coupon`, `SecurityLog`, and `CustomizationRequest`.

Check these before import:

- every relation key points to an existing record;
- emails, slugs, SKUs, coupon codes, and the cart/wishlist composite keys are unique;
- JSON fields (`shippingAddress`, `trackingDetails`, `customizationConfig`, CMS fields) contain valid JSON;
- dates are exported as ISO-8601 dates, not formatted display strings.

## 3. Convert `packages/database/prisma/schema.prisma`

Make a dedicated commit for the schema conversion. Apply these rules to the existing schema:

1. Change the datasource:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

2. For every model whose current ID is `String @id @default(uuid())`, preserve it and map it to MongoDB `_id`:

```prisma
id String @id @default(uuid()) @map("_id")
```

For `Order`, retain its existing human-readable `DOD-XXXXXX` ID and use:

```prisma
id String @id @map("_id")
```

For the singleton `CMSConfig` record, use:

```prisma
id String @id @default("singleton") @map("_id")
```

3. Remove every PostgreSQL-only `@db.Text` annotation. Plain `String` is stored as BSON text.

4. Keep `String[]` and `Json` fields: Prisma maps them naturally to MongoDB arrays and embedded documents.

5. Remove `onDelete: Cascade` and `onDelete: SetNull` relation options. MongoDB does not enforce foreign keys or cascade deletes. Implement cleanup explicitly in the API (and use a transaction where the operation writes multiple collections).

6. Keep the existing `@unique`, `@@unique`, and `@@index` declarations. They create MongoDB indexes. Composite uniqueness for carts and wishlists remains important.

7. Keep all relation scalar fields as `String`; because this plan keeps UUID string IDs, do **not** add `@db.ObjectId` to `customerId`, `productId`, etc.

Example conversions:

```prisma
model Product {
  id         String   @id @default(uuid()) @map("_id")
  slug       String   @unique
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])
  description String
  images     String[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model CartItem {
  id         String   @id @default(uuid()) @map("_id")
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  quantity   Int      @default(1)
  size       String
  createdAt  DateTime @default(now())

  @@unique([customerId, productId, size])
}
```

If starting from an empty database and you specifically want BSON ObjectIds, use `@default(auto()) @map("_id") @db.ObjectId` for the primary ID and `@db.ObjectId` on each matching relation key. That is a separate migration because every existing UUID foreign key must be remapped.

## 4. Create the empty MongoDB schema

First validate the changed Prisma schema, then create collections and indexes in a **new empty development database**:

```powershell
cd packages/database
npx prisma validate
npx prisma db push
npx prisma generate
```

For Prisma 6 (the version pinned in this repository), MongoDB uses `prisma db push`; Prisma Migrate commands such as `prisma migrate dev` and `prisma migrate deploy` do not apply to MongoDB.

## 5. Copy the data

Do not use `prisma db push` as a data-transfer command—it creates collections and indexes but does not copy PostgreSQL rows.

Use a repeatable migration script or ETL tool that:

1. reads the PostgreSQL records in dependency order;
2. writes them to the same-named MongoDB collections with the original ID under `_id`;
3. preserves dates as BSON `Date` values and JSON fields as objects/arrays;
4. writes child data only after its parents;
5. records counts, failures, and the source ID for each write;
6. is safe to re-run (`upsert` by `_id`).

Recommended import order:

1. `AdminUser`, `Category`, `Collection`, `Customer`, `OldCustomer`, `CMSConfig`, `Coupon`, `ContactForm`, `SecurityLog`
2. `Product`
3. `Address`, `CartItem`, `WishlistItem`, `InventoryLog`, `CustomizationRequest`
4. `Order`
5. `OrderItem`, `ReturnRequest`

If the PostgreSQL database is unavailable and `db-fallback.json` is the source of truth, import its collections with the same rules. Review it carefully first: it may be an incomplete fallback rather than the complete production dataset.

## 6. Update application behaviour

Most existing Prisma queries can stay unchanged because the model and field names are preserved. Review the write paths below, especially every use of `prisma.$transaction`:

- `dodshop/src/app/api/checkout/route.ts`
- `dodshop/src/app/api/cart/route.ts`
- `dodshop/src/app/api/wishlist/route.ts`
- `dodshop/src/app/api/addresses/route.ts`
- `Dashbord/src/app/api/inventory/adjust/route.ts`

Also replace comments that say “PostgreSQL” and decide whether `fallbackDb` should remain. In production, a missing `DATABASE_URL` should fail clearly rather than save durable business data to the JSON fallback.

## 7. Verify before cutover

Run these checks against staging before replacing the production environment variable:

- `npx prisma validate`, `npx prisma db push`, and `npx prisma generate` succeed.
- MongoDB collection counts equal the PostgreSQL counts.
- Every imported relation key resolves to a parent document.
- Unique indexes exist for email, slug, SKU, coupon code, category/collection names, and the cart/wishlist composite keys.
- Customer signup/login, product management, cart, wishlist, checkout, address management, inventory adjustment, order history, return requests, CMS, contact forms, and customization requests all work.
- Restart the app and confirm newly written data remains available.

After verification, set the production `DATABASE_URL` to the Atlas URI, redeploy both apps, and monitor errors and MongoDB connections. Keep the PostgreSQL backup until the agreed retention date.

## Rollback

If the cutover fails, restore the prior PostgreSQL `DATABASE_URL` and redeploy the previously working build. Do not delete the MongoDB database during investigation; it contains useful migration evidence.

## References

- [Prisma MongoDB setup and schema examples](https://www.prisma.io/docs/orm/add-to-existing-project/mongodb)
- [Prisma CLI migration guidance](https://docs.prisma.io/docs/cli/migrate)
