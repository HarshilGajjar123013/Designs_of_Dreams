import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { resolveCustomer } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get('userId');
    const customer = await resolveCustomer(req, queryUserId);

    if (!customer) {
      return NextResponse.json({
        success: true,
        addresses: []
      });
    }

    const userId = customer.userId;

    let addresses: any[] = [];
    let databaseConnected = true;

    try {
      // 1. Try PostgreSQL Database via Prisma
      addresses = await prisma.address.findMany({
        where: { customerId: userId },
        orderBy: { isDefault: 'desc' }
      });
    } catch (dbError) {
      console.warn('⚠️ Addresses GET DB query failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Query fallback database
      const customers = fallbackDb.getCollection('customers');
      const customer = customers.find(c => c.id === userId);
      const rawAddresses = customer?.addresses || [];

      // Normalize address data in fallback in case of mixed formats
      addresses = rawAddresses.map((addr: any) => {
        if (addr.address && !addr.line1) {
          return {
            id: addr.id || 'addr-default',
            label: addr.type || 'Home',
            line1: addr.address,
            line2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
            phone: customer.phone || '',
            isDefault: true
          };
        }
        return {
          id: addr.id || 'addr-' + randomUUID(),
          label: addr.label || 'Home',
          line1: addr.line1 || '',
          line2: addr.line2 || '',
          city: addr.city || '',
          state: addr.state || '',
          postalCode: addr.postalCode || '',
          country: addr.country || 'India',
          phone: addr.phone || '',
          isDefault: addr.isDefault || false
        };
      });
    }

    return NextResponse.json({
      success: true,
      addresses
    });

  } catch (err: any) {
    console.error('Error fetching addresses:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve addresses' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, userId: bodyUserId } = body;
    const customer = await resolveCustomer(req, bodyUserId);

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer session or user ID required' },
        { status: 401 }
      );
    }

    const userId = customer.userId;

    if (!address) {
      return NextResponse.json(
        { error: 'Address details are required' },
        { status: 400 }
      );
    }

    let databaseConnected = true;
    let savedAddress: any = null;

    try {
      // 1. Try PostgreSQL Database via Prisma (Rebuild trigger)
      savedAddress = await prisma.$transaction(async (tx: any) => {
        // If this address is set to default, unset other default addresses for the user
        if (address.isDefault) {
          await tx.address.updateMany({
            where: { customerId: userId },
            data: { isDefault: false }
          });
        }

        if (address.id) {
          // Update existing
          return await tx.address.update({
            where: { id: address.id, customerId: userId },
            data: {
              label: address.label,
              line1: address.line1,
              line2: address.line2 || null,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country || 'India',
              phone: address.phone || null,
              isDefault: address.isDefault || false
            }
          });
        } else {
          // Create new
          return await tx.address.create({
            data: {
              customerId: userId,
              label: address.label || 'Home',
              line1: address.line1,
              line2: address.line2 || null,
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country || 'India',
              phone: address.phone || null,
              isDefault: address.isDefault || false
            }
          });
        }
      });
    } catch (dbError) {
      console.warn('⚠️ Address POST DB query failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Query fallback database
      const customers = fallbackDb.getCollection('customers');
      const index = customers.findIndex(c => c.id === userId);

      if (index > -1) {
        const customer = customers[index];
        if (!customer.addresses) customer.addresses = [];

        // Normalize existing addresses first
        customer.addresses = customer.addresses.map((addr: any) => {
          if (addr.address && !addr.line1) {
            return {
              id: addr.id || 'addr-default',
              label: addr.type || 'Home',
              line1: addr.address,
              line2: '',
              city: '',
              state: '',
              postalCode: '',
              country: 'India',
              phone: customer.phone || '',
              isDefault: true
            };
          }
          return addr;
        });

        if (address.isDefault) {
          customer.addresses.forEach((a: any) => {
            a.isDefault = false;
          });
        }

        if (address.id) {
          // Update address
          const addrIndex = customer.addresses.findIndex((a: any) => a.id === address.id);
          if (addrIndex > -1) {
            customer.addresses[addrIndex] = {
              id: address.id,
              label: address.label,
              line1: address.line1,
              line2: address.line2 || '',
              city: address.city,
              state: address.state,
              postalCode: address.postalCode,
              country: address.country || 'India',
              phone: address.phone || '',
              isDefault: address.isDefault || false
            };
            savedAddress = customer.addresses[addrIndex];
          } else {
            return NextResponse.json(
              { error: 'Address not found for update' },
              { status: 404 }
            );
          }
        } else {
          // Create address
          const newAddress = {
            id: 'addr-' + randomUUID(),
            label: address.label || 'Home',
            line1: address.line1,
            line2: address.line2 || '',
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country || 'India',
            phone: address.phone || '',
            isDefault: address.isDefault || false
          };
          customer.addresses.push(newAddress);
          savedAddress = newAddress;
        }

        customers[index] = customer;
        fallbackDb.saveCollection('customers', customers);
      } else {
        return NextResponse.json(
          { error: 'User not found in fallback database' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      address: savedAddress
    });

  } catch (err: any) {
    console.error('Error saving address:', err);
    return NextResponse.json(
      { error: 'Failed to save address details' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('addressId');
    const queryUserId = searchParams.get('userId');
    const customer = await resolveCustomer(req, queryUserId);

    if (!customer || !addressId) {
      return NextResponse.json(
        { error: 'Customer session and address ID are required' },
        { status: 400 }
      );
    }

    const userId = customer.userId;

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    let databaseConnected = true;

    try {
      // 1. Try PostgreSQL Database via Prisma
      await prisma.address.delete({
        where: { id: addressId, customerId: userId }
      });
    } catch (dbError) {
      console.warn('⚠️ Address DELETE DB call failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    if (!databaseConnected) {
      // 2. Query fallback database
      const customers = fallbackDb.getCollection('customers');
      const index = customers.findIndex(c => c.id === userId);

      if (index > -1) {
        const customer = customers[index];
        if (customer.addresses) {
          customer.addresses = customer.addresses.filter((a: any) => a.id !== addressId);
        }
        customers[index] = customer;
        fallbackDb.saveCollection('customers', customers);
      } else {
        return NextResponse.json(
          { error: 'User not found in fallback database' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true
    });

  } catch (err: any) {
    console.error('Error deleting address:', err);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
