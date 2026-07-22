import { PrismaClient, Role, CustomerType, CustomerStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Clean existing records
  await prisma.salesItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users for each Role
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@erp.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      name: 'Alex Sales Rep',
      email: 'sales@erp.com',
      password: hashedPassword,
      role: Role.SALES,
      isActive: true,
    },
  });

  const warehouseUser = await prisma.user.create({
    data: {
      name: 'John Warehouse Manager',
      email: 'warehouse@erp.com',
      password: hashedPassword,
      role: Role.WAREHOUSE,
      isActive: true,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Sarah Accountant',
      email: 'accounts@erp.com',
      password: hashedPassword,
      role: Role.ACCOUNTS,
      isActive: true,
    },
  });

  console.log('✅ Created 4 Users (Admin, Sales, Warehouse, Accounts)');

  // 3. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Apex Global Enterprises',
      email: 'contact@apexglobal.com',
      phone: '+1 555 019 2834',
      company: 'Apex Global Inc.',
      address: '100 Innovation Way, Suite 400, New York, NY',
      type: CustomerType.DISTRIBUTOR,
      status: CustomerStatus.ACTIVE,
      createdById: salesUser.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Quantum Retail Logistics',
      email: 'orders@quantumretail.io',
      phone: '+1 555 018 9988',
      company: 'Quantum Stores',
      address: '750 Commerce Boulevard, Chicago, IL',
      type: CustomerType.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      createdById: salesUser.id,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Horizon Innovations Lead',
      email: 'info@horizoninnovate.com',
      phone: '+1 555 012 3344',
      company: 'Horizon Corp',
      address: '45 Tech Plaza, Austin, TX',
      type: CustomerType.RETAIL,
      status: CustomerStatus.LEAD,
      createdById: salesUser.id,
    },
  });

  console.log('✅ Created 3 Customers');

  // 4. Create FollowUp Notes
  await prisma.followUp.createMany({
    data: [
      {
        customerId: customer1.id,
        notes: 'Discussed Q3 bulk discount rates for distributor agreement. Promised proposal by Friday.',
        followUpDate: new Date(Date.now() + 86400000 * 3),
        status: 'PENDING',
        createdById: salesUser.id,
      },
      {
        customerId: customer1.id,
        notes: 'Initial intro call completed. Customer expressed interest in Electronics catalog.',
        status: 'COMPLETED',
        createdById: salesUser.id,
      },
      {
        customerId: customer3.id,
        notes: 'Sent product brochure and price quote for trial batch.',
        status: 'PENDING',
        createdById: salesUser.id,
      },
    ],
  });

  console.log('✅ Created Follow-up Notes');

  // 5. Create Products
  const prod1 = await prisma.product.create({
    data: {
      sku: 'SKU-ELEC-001',
      name: 'UltraHD Smart Industrial Sensor v4',
      category: 'Electronics',
      description: 'High precision wireless IoT sensor node for warehouse climate automation.',
      unitPrice: 249.99,
      costPrice: 140.0,
      stockQuantity: 150,
      minStockAlert: 20,
      warehouseLocation: 'Warehouse A - Rack 12',
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      sku: 'SKU-NET-002',
      name: 'Gigabit Managed PoE Switch 24-Port',
      category: 'Networking',
      description: 'Enterprise rackmount switch with 370W PoE budget.',
      unitPrice: 499.0,
      costPrice: 320.0,
      stockQuantity: 12, // LOW STOCK ALERT TRIGGER
      minStockAlert: 15,
      warehouseLocation: 'Warehouse A - Rack 05',
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      sku: 'SKU-CAB-003',
      name: 'Cat6 Shielded Ethernet Cable 100m Roll',
      category: 'Cabling',
      description: 'Pure copper 23AWG plenum rated heavy duty cabling.',
      unitPrice: 89.5,
      costPrice: 45.0,
      stockQuantity: 80,
      minStockAlert: 10,
      warehouseLocation: 'Warehouse B - Bin 03',
    },
  });

  console.log('✅ Created 3 Products');

  // 6. Create Initial Inventory Movements
  await prisma.inventoryMovement.createMany({
    data: [
      {
        productId: prod1.id,
        movementType: MovementType.IN,
        quantity: 150,
        reason: 'Initial stock intake from factory supplier',
        referenceNumber: 'PO-2026-901',
        createdById: warehouseUser.id,
      },
      {
        productId: prod2.id,
        movementType: MovementType.IN,
        quantity: 15,
        reason: 'Initial stock intake',
        referenceNumber: 'PO-2026-902',
        createdById: warehouseUser.id,
      },
      {
        productId: prod2.id,
        movementType: MovementType.OUT,
        quantity: 3,
        reason: 'Internal QC lab testing sample',
        referenceNumber: 'QC-TEST-01',
        createdById: warehouseUser.id,
      },
    ],
  });

  console.log('✅ Created Inventory Movements');

  // 7. Create Sales Challans
  const challanConfirmed = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-00001',
      customerId: customer1.id,
      status: ChallanStatus.CONFIRMED,
      totalAmount: 249.99 * 2 + 89.5 * 5,
      notes: 'Urgent delivery request via Express Freight.',
      createdById: salesUser.id,
      confirmedById: warehouseUser.id,
      confirmedAt: new Date(),
      items: {
        create: [
          {
            productId: prod1.id,
            skuSnapshot: prod1.sku,
            nameSnapshot: prod1.name,
            unitPriceSnapshot: prod1.unitPrice,
            quantity: 2,
            subtotal: prod1.unitPrice * 2,
          },
          {
            productId: prod3.id,
            skuSnapshot: prod3.sku,
            nameSnapshot: prod3.name,
            unitPriceSnapshot: prod3.unitPrice,
            quantity: 5,
            subtotal: prod3.unitPrice * 5,
          },
        ],
      },
    },
  });

  const challanDraft = await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-2026-00002',
      customerId: customer2.id,
      status: ChallanStatus.DRAFT,
      totalAmount: 499.0 * 1,
      notes: 'Pending customer PO confirmation.',
      createdById: salesUser.id,
      items: {
        create: [
          {
            productId: prod2.id,
            skuSnapshot: prod2.sku,
            nameSnapshot: prod2.name,
            unitPriceSnapshot: prod2.unitPrice,
            quantity: 1,
            subtotal: prod2.unitPrice * 1,
          },
        ],
      },
    },
  });

  console.log('✅ Created Sales Challans (Confirmed & Draft)');
  console.log('🎉 Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
