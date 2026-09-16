import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { randomUUID } from 'crypto';
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
    const userRole = session!.role;
    const userId = session!.id;

    // Allow SUPER_ADMIN to edit anyone, and any user to edit themselves
    if (userRole !== 'SUPER_ADMIN' && userId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status, name, email, avatar } = await req.json();

    // Prevent non-SUPER_ADMIN from toggling status
    if (status && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Administrators can change status' }, { status: 403 });
    }

    if (status && status !== 'ACTIVE' && status !== 'INACTIVE') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    let updatedAdmin: any = null;
    let databaseConnected = true;

    try {
      const admin = await prisma.adminUser.findUnique({
        where: { id }
      });

      if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      }

      if (status && admin.role === 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Super Administrator status cannot be toggled' }, { status: 400 });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (avatar !== undefined) updateData.avatar = avatar;

      updatedAdmin = await prisma.adminUser.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          status: true,
          lastLogin: true,
          createdAt: true
        }
      });

      // Security Audit Log
      await prisma.securityLog.create({
        data: {
          action: status 
            ? `Toggled admin account status for ${admin.name} to ${status}`
            : `Updated admin profile for ${admin.name}`,
          adminName: `Admin ID: ${userId}`,
          role: userRole,
          status: 'SUCCESS'
        }
      });

    } catch (dbError) {
      console.warn('⚠️ Database update failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const admins = fallbackDb.getCollection('admins');
      const idx = admins.findIndex(a => a.id === id);

      if (idx === -1) {
        return NextResponse.json({ error: 'Admin not found in fallback' }, { status: 404 });
      }

      const admin = admins[idx];

      if (status && admin.role === 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Super Administrator status cannot be toggled' }, { status: 400 });
      }

      if (status) admin.status = status;
      if (name) admin.name = name;
      if (email) admin.email = email;
      if (avatar !== undefined) admin.avatar = avatar;

      admins[idx] = admin;
      fallbackDb.saveCollection('admins', admins);

      // Audit Log Fallback
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: status 
          ? `Toggled admin status (Fallback) for ${admin.name} to ${status}`
          : `Updated admin profile (Fallback) for ${admin.name}`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS'
      });
      fallbackDb.saveCollection('securityLogs', secLogs);

      updatedAdmin = admin;
    }

    return NextResponse.json({
      success: true,
      admin: updatedAdmin
    });

  } catch (err: any) {
    console.error('Admin PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update admin user' },
      { status: 500 }
    );
  }
}
