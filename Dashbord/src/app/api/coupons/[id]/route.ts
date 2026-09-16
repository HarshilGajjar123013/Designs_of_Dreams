import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { active } = body;

    let databaseConnected = true;
    let updatedCoupon = null;

    try {
      const dbCoupon = await prisma.coupon.update({
        where: { id },
        data: { isActive: active }
      });
      updatedCoupon = {
        id: dbCoupon.id,
        code: dbCoupon.code,
        discountPercent: dbCoupon.discountPercent,
        active: dbCoupon.isActive,
        minOrder: dbCoupon.minOrderValue
      };
    } catch (e) {
      console.warn('⚠️ Database PATCH failed, falling back to JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const coupons = fallbackDb.getCollection('coupons');
      const idx = coupons.findIndex(c => c.id === id || c.code === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
      }

      coupons[idx].active = active;
      coupons[idx].updatedAt = new Date().toISOString();
      
      fallbackDb.saveCollection('coupons', coupons);
      updatedCoupon = coupons[idx];
    }

    return NextResponse.json({ success: true, coupon: updatedCoupon });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to toggle coupon status' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await verifyAdminSession();
    if (response) return response;

    const resolvedParams = await params;
    const { id } = resolvedParams;

    let databaseConnected = true;

    try {
      await prisma.coupon.delete({
        where: { id }
      });
    } catch (e) {
      console.warn('⚠️ Database DELETE failed, falling back to JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      let coupons = fallbackDb.getCollection('coupons');
      coupons = coupons.filter(c => c.id !== id && c.code !== id);
      fallbackDb.saveCollection('coupons', coupons);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
