import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { createAdminSchema } from '@/lib/validators';
import { randomUUID } from 'crypto';

const FALLBACK_DEFAULT_ADMINS = [
  {
    id: 'dev-fallback-super-admin',
    name: 'Khyati Acharya',
    email: 'dod@gmail.com',
    role: 'SUPER_ADMIN',
    avatar: 'KA',
    status: 'ACTIVE',
    lastLogin: ''
  },
  {
    id: 'dev-fallback-manager',
    name: 'Harshil Gajjar',
    email: 'harshilgajjar124@gmail.com',
    role: 'MANAGER',
    avatar: 'HG',
    status: 'ACTIVE',
    lastLogin: ''
  }
];

import { verifyAdminSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { session, response } = await verifyAdminSession('SUPER_ADMIN');
    if (response) return response;

    let admins: any[] = [];
    let databaseConnected = true;

    try {
      admins = await prisma.adminUser.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          status: true,
          lastLogin: true,
          createdAt: true
        },
        orderBy: {
          name: 'asc'
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Database query failed, using fallback JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      admins = fallbackDb.getCollection('admins');
      if (admins.length === 0) {
        // Seed default admins in fallback if empty
        fallbackDb.saveCollection('admins', FALLBACK_DEFAULT_ADMINS);
        admins = FALLBACK_DEFAULT_ADMINS;
      }
      // Sort by name ascending
      admins.sort((a, b) => a.name.localeCompare(b.name));
    }

    return NextResponse.json({
      success: true,
      admins
    });

  } catch (err: any) {
    console.error('Admins GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve admin users' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { session, response } = await verifyAdminSession('SUPER_ADMIN');
    if (response) return response;
    const userRole = session!.role;
    const userId = session!.id;

    const body = await req.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, role, avatar: reqAvatar } = parsed.data;

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = reqAvatar || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    let newAdmin = null;
    let databaseConnected = true;

    try {
      // Check existing email
      const existing = await prisma.adminUser.findUnique({
        where: { email }
      });
      if (existing) {
        return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 400 });
      }

      newAdmin = await prisma.adminUser.create({
        data: {
          name,
          email,
          passwordHash,
          role,
          avatar,
          status: 'ACTIVE'
        },
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
          action: `Created new admin account: ${name} (${email}, Role: ${role})`,
          adminName: `Admin ID: ${userId}`,
          role: userRole,
          status: 'SUCCESS'
        }
      });

    } catch (dbError: any) {
      console.warn('⚠️ Database create failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      const admins = fallbackDb.getCollection('admins');
      
      // Seed default fallback if empty
      const currentAdmins = admins.length === 0 ? [...FALLBACK_DEFAULT_ADMINS] : admins;

      const existing = currentAdmins.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return NextResponse.json({ error: 'An admin with this email already exists in fallback' }, { status: 400 });
      }

      const id = 'adm-' + randomUUID();
      newAdmin = {
        id,
        name,
        email,
        role,
        avatar,
        passwordHash,
        status: 'ACTIVE',
        lastLogin: null,
        createdAt: new Date().toISOString()
      };

      currentAdmins.push(newAdmin);
      fallbackDb.saveCollection('admins', currentAdmins);

      // Audit Log Fallback
      const secLogs = fallbackDb.getCollection('securityLogs');
      secLogs.push({
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        action: `Created new admin account (Fallback): ${name} (${email}, Role: ${role})`,
        adminName: `Admin ID: ${userId}`,
        role: userRole,
        status: 'SUCCESS'
      });
      fallbackDb.saveCollection('securityLogs', secLogs);
    }

    return NextResponse.json({
      success: true,
      admin: newAdmin
    });

  } catch (err: any) {
    console.error('Admins POST error:', err);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}
