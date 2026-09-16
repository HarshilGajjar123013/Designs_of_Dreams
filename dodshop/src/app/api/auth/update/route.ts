import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { resolveCustomer } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, newEmail, phone, avatar, userId: bodyUserId } = body;
    const customer = await resolveCustomer(req, bodyUserId);

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid customer session or user ID required' },
        { status: 401 }
      );
    }

    const userId = customer.userId;

    let updatedCustomer: any = null;
    let databaseConnected = true;

    try {
      const existing = await prisma.customer.findUnique({
        where: { id: userId },
      });

      if (existing) {
        const updateData: any = {};
        if (name) updateData.name = name;
        if (newEmail) updateData.email = newEmail;
        if (phone !== undefined) updateData.phone = phone;
        if (avatar !== undefined) updateData.avatar = avatar;

        updatedCustomer = await prisma.customer.update({
          where: { id: userId },
          data: updateData
        });
      }
    } catch (dbError) {
      console.warn('⚠️ Update profile DB call failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const customers = fallbackDb.getCollection('customers');
      const index = customers.findIndex(c => c.id === userId);

      if (index > -1) {
        const current = customers[index];
        const updated = {
          ...current,
          name: name || current.name,
          email: newEmail || current.email,
          phone: phone !== undefined ? phone : current.phone,
          avatar: avatar !== undefined ? avatar : current.avatar,
          updatedAt: new Date().toISOString()
        };
        customers[index] = updated;
        fallbackDb.saveCollection('customers', customers);
        updatedCustomer = updated;
      }
    }

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedCustomer.id,
        email: updatedCustomer.email,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone || '',
        avatar: updatedCustomer.avatar || '',
        isLoggedIn: true
      }
    });

  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json(
      { error: 'Failed to update profile details' },
      { status: 500 }
    );
  }
}
