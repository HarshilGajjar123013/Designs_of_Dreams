import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { randomUUID } from 'crypto';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;
    let coupons: any[] = [];
    let databaseConnected = true;

    try {
      const dbCoupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' }
      });
      coupons = dbCoupons.map((c: any) => ({
        id: c.id,
        code: c.code,
        discountPercent: c.discountPercent,
        active: c.isActive,
        minOrder: c.minOrderValue
      }));
    } catch (e) {
      console.warn('⚠️ Database GET failed, falling back to JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      coupons = fallbackDb.getCollection('coupons');
      coupons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const body = await req.json();
    const { code, discountPercent, minOrder } = body;

    if (!code || !discountPercent) {
      return NextResponse.json({ error: 'Missing code or discount percent' }, { status: 400 });
    }

    let databaseConnected = true;
    let newCoupon = null;

    try {
      const dbCoupon = await prisma.coupon.create({
        data: {
          code: code.toUpperCase(),
          discountPercent: parseFloat(discountPercent),
          minOrderValue: minOrder ? parseFloat(minOrder) : 0,
          isActive: true
        }
      });
      newCoupon = {
        id: dbCoupon.id,
        code: dbCoupon.code,
        discountPercent: dbCoupon.discountPercent,
        active: dbCoupon.isActive,
        minOrder: dbCoupon.minOrderValue
      };
    } catch (e) {
      console.warn('⚠️ Database CREATE failed, falling back to JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const coupons = fallbackDb.getCollection('coupons');
      
      if (coupons.some(c => c.code === code.toUpperCase())) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
      }

      newCoupon = {
        id: randomUUID(),
        code: code.toUpperCase(),
        discountPercent: parseFloat(discountPercent),
        active: true,
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      coupons.push(newCoupon);
      fallbackDb.saveCollection('coupons', coupons);
    }

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
