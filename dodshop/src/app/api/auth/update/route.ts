import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { resolveCustomer } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const customer = await resolveCustomer(req);

    if (!customer) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid customer session required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, newEmail, phone, avatar, userId: bodyUserId } = body;

    // Cross-account protection: If client explicitly passed a userId that does not match their session, forbid it
    if (bodyUserId && bodyUserId !== customer.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot modify an account other than your own' },
        { status: 403 }
      );
    }

    const userId = customer.userId;

    // Validate email if changed
    if (newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
      }
    }

    let updatedCustomer: any = null;
    let databaseConnected = true;

    try {
      const existing = await prisma.customer.findUnique({
        where: { id: userId },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      // Check if new email is already claimed by someone else
      if (newEmail && newEmail.toLowerCase() !== existing.email?.toLowerCase()) {
        const emailTaken = await prisma.customer.findUnique({
          where: { email: newEmail.toLowerCase() }
        });
        if (emailTaken && emailTaken.id !== userId) {
          return NextResponse.json({ error: 'This email is already in use by another account' }, { status: 400 });
        }
      }

      const updateData: any = {};
      if (name && typeof name === 'string') updateData.name = name.trim().slice(0, 100);
      if (newEmail) updateData.email = newEmail.toLowerCase().trim();
      if (phone !== undefined) updateData.phone = typeof phone === 'string' ? phone.trim().slice(0, 20) : null;
      if (avatar !== undefined) updateData.avatar = typeof avatar === 'string' ? avatar.trim().slice(0, 500) : null;

      updatedCustomer = await prisma.customer.update({
        where: { id: userId },
        data: updateData
      });
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
