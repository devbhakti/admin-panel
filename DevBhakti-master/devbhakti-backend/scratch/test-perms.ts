import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'devbhakti_secret_key_2026';
const API_URL = 'http://localhost:5000/api';

async function testPermissionSystem() {
  try {
    console.log('--- Testing Permission System ---');

    // 1. Ensure permission exists
    let perm = await prisma.permission.findUnique({ where: { key: 'poojas.edit' } });
    if (!perm) {
      console.log('Creating poojas.edit permission...');
      perm = await prisma.permission.create({
        data: {
          key: 'poojas.edit',
          label: 'Edit Poojas',
          module: 'POOJAS',
          applicableTo: ['ADMIN', 'TEMPLE']
        }
      });
    }

    // 2. Create a Role
    console.log('Creating test role...');
    const role = await prisma.role.create({
      data: {
        name: 'Test Editor',
        ownerType: 'ADMIN',
        ownerId: 'SUPER_ADMIN',
        rolePermissions: {
          create: { permissionId: perm.id }
        }
      }
    });

    // 3. Create a Staff Member
    console.log('Creating test staff...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const staff = await prisma.staffMember.create({
      data: {
        name: 'Test Staff',
        email: `test_staff_${Date.now()}@example.com`,
        password: hashedPassword,
        ownerType: 'ADMIN',
        ownerId: 'SUPER_ADMIN',
        staffRoles: {
          create: { roleId: role.id }
        }
      }
    });

    // 4. Simulate Login (get permissions)
    const staffWithPerms = await prisma.staffMember.findUnique({
      where: { id: staff.id },
      include: {
        staffRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    const permissions: string[] = [];
    staffWithPerms?.staffRoles.forEach(sr => {
      sr.role.rolePermissions.forEach(rp => {
        permissions.push(rp.permission.key);
      });
    });

    console.log(`Permissions in token: ${permissions.join(', ')}`);

    const token = jwt.sign(
      {
        staffId: staff.id,
        ownerType: staff.ownerType,
        ownerId: staff.ownerId,
        isStaff: true,
        permissions,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Test API Call
    console.log('Calling toggle-status API...');
    try {
      const pooja = await prisma.pooja.findFirst();
      if (!pooja) {
        console.log('No pooja found to test toggle.');
      } else {
        const res = await axios.patch(`${API_URL}/admin/poojas/${pooja.id}/toggle-status`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API Response:', res.status, res.data);
      }
    } catch (err: any) {
      console.error('API Error:', err.response?.status, err.response?.data);
    }

    // Cleanup
    await prisma.staffRole.deleteMany({ where: { staffId: staff.id } });
    await prisma.staffMember.delete({ where: { id: staff.id } });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.role.delete({ where: { id: role.id } });

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPermissionSystem();
