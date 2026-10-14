const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database...');

  // 1. Categories
  const categories = [
    { id: 'cat-1', name: 'Smart TVs', description: '4K, OLED, QLED Smart Televisions' },
    { id: 'cat-2', name: 'Smartphones', description: 'Flagship and Budget Android & iOS devices' },
    { id: 'cat-3', name: 'Laptops & Computers', description: 'Ultrabooks, Gaming, and Productivity Laptops' },
    { id: 'cat-4', name: 'Audio & Sound', description: 'Headphones, TWS, Soundbars & Bluetooth Speakers' },
    { id: 'cat-5', name: 'Accessories & Storage', description: 'External SSDs, Keyboards, Mice, Cables' },
    { id: 'cat-6', name: 'Printers & Imaging', description: 'Inkjet, Laser Printers & Scanners' },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }
  console.log('✔ Categories seeded');

  // 2. Suppliers
  const suppliers = [
    { id: 'sup-1', name: 'Rajesh Sharma', company: 'Apex Electronics Dist. Ltd.', phone: '+91 98201 11223', email: 'rajesh@apexelectronics.in', address: 'Plot 44, Lamington Road, Mumbai - 400007', gstin: '27AABCA1234F1Z5', status: 'active' },
    { id: 'sup-2', name: 'Vikram Mehta', company: 'Global Tech Wholesale', phone: '+91 98102 33445', email: 'sales@globaltechdist.com', address: 'B-12, Nehru Place, New Delhi - 110019', gstin: '07AAECG5678K1ZQ', status: 'active' },
    { id: 'sup-3', name: 'Suresh Patel', company: 'Zenith Components Pvt Ltd', phone: '+91 98303 55667', email: 'spatel@zenithcomp.com', address: 'Shop 8, SP Road, Bengaluru - 560002', gstin: '29AADCZ9012L1Z3', status: 'active' },
    { id: 'sup-4', name: 'Ananya Sen', company: 'Eastern DigiSupply', phone: '+91 98404 77889', email: 'ananya@easterndigi.co.in', address: 'Chandni Chowk Market, Kolkata - 700072', gstin: '19AABCE3456M1Z8', status: 'active' },
  ];

  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    });
  }
  console.log('✔ Suppliers seeded');

  // 3. Products
  const products = [
    { id: 'prod-1', name: 'Samsung 55" Crystal 4K Smart TV', sku: 'SAM-TV-55-C4K', categoryId: 'cat-1', brand: 'Samsung', model: 'UA55CUE70AKLXL', supplierId: 'sup-1', stock: 12, minStock: 3, purchasePrice: 38000, sellingPrice: 47990, warrantyPeriodMonths: 24, description: '55-inch Ultra HD 4K Crystal Processor TV with HDR10+ and Tizen OS' },
    { id: 'prod-2', name: 'LG 43" Full HD Smart LED TV', sku: 'LG-TV-43-FHD', categoryId: 'cat-1', brand: 'LG', model: '43LM5650PTA', supplierId: 'sup-1', stock: 8, minStock: 2, purchasePrice: 22000, sellingPrice: 28990, warrantyPeriodMonths: 12, description: '43-inch FHD WebOS Smart TV with Active HDR and DTS Virtual:X' },
    { id: 'prod-3', name: 'Sony Bravia 65" 4K OLED Google TV', sku: 'SON-TV-65-OLED', categoryId: 'cat-1', brand: 'Sony', model: 'XR-65A80L', supplierId: 'sup-1', stock: 2, minStock: 2, purchasePrice: 165000, sellingPrice: 219900, warrantyPeriodMonths: 24, description: 'Premium 65-inch OLED with Cognitive Processor XR and Acoustic Surface Audio+' },
    { id: 'prod-4', name: 'Apple iPhone 15 (128GB, Black)', sku: 'APL-IP15-128', categoryId: 'cat-2', brand: 'Apple', model: 'MTP03HN/A', supplierId: 'sup-2', stock: 6, minStock: 4, purchasePrice: 66000, sellingPrice: 79900, warrantyPeriodMonths: 12, description: 'A16 Bionic chip, Dynamic Island, 48MP main camera, USB-C' },
    { id: 'prod-5', name: 'Samsung Galaxy S24 5G (256GB)', sku: 'SAM-S24-256', categoryId: 'cat-2', brand: 'Samsung', model: 'SM-S921B', supplierId: 'sup-2', stock: 15, minStock: 5, purchasePrice: 62000, sellingPrice: 74999, warrantyPeriodMonths: 12, description: 'Galaxy AI, Snapdragon 8 Gen 3, Dynamic AMOLED 2X 120Hz' },
    { id: 'prod-6', name: 'Dell Inspiron 15 (i5 13th Gen / 16GB / 512GB)', sku: 'DEL-INS-15', categoryId: 'cat-3', brand: 'Dell', model: 'IN3530', supplierId: 'sup-3', stock: 7, minStock: 3, purchasePrice: 48000, sellingPrice: 59990, warrantyPeriodMonths: 12, description: 'Intel Core i5-1335U, 16GB DDR4, 512GB NVMe SSD, 15.6" FHD 120Hz' },
    { id: 'prod-7', name: 'HP Pavilion 14 (Ryzen 5 / 16GB / 512GB)', sku: 'HP-PAV-14', categoryId: 'cat-3', brand: 'HP', model: '14-ec1003AU', supplierId: 'sup-3', stock: 4, minStock: 3, purchasePrice: 44000, sellingPrice: 54990, warrantyPeriodMonths: 12, description: 'AMD Ryzen 5 5625U, 16GB DDR4, 512GB SSD, 14" FHD IPS display' },
    { id: 'prod-8', name: 'Sony WH-1000XM5 Noise Cancelling Headphones', sku: 'SON-SPK-XB23', categoryId: 'cat-4', brand: 'Sony', model: 'WH1000XM5/B', supplierId: 'sup-4', stock: 9, minStock: 3, purchasePrice: 24000, sellingPrice: 29990, warrantyPeriodMonths: 12, description: 'Industry-leading noise cancellation with 8 mics, 30h battery life' },
    { id: 'prod-9', name: 'Logitech MX Master 3S Wireless Mouse', sku: 'LOG-MX-M3S', categoryId: 'cat-5', brand: 'Logitech', model: '910-006561', supplierId: 'sup-3', stock: 22, minStock: 8, purchasePrice: 6500, sellingPrice: 8995, warrantyPeriodMonths: 12, description: '8K DPI any-surface tracking, quiet clicks, MagSpeed electromagnetic scrolling' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log('✔ Products seeded');

  // 4. Serials
  const serials = [
    { id: 'ser-1', productId: 'prod-1', productName: 'Samsung 55" Crystal 4K Smart TV', serialNumber: 'SAM55KLA001', imei: null, status: 'sold', dateAdded: new Date('2024-01-15'), dateSold: new Date('2024-02-10'), customerRef: 'CUST-Sharma Electronics' },
    { id: 'ser-2', productId: 'prod-1', productName: 'Samsung 55" Crystal 4K Smart TV', serialNumber: 'SAM55KLA002', imei: null, status: 'sold', dateAdded: new Date('2024-01-15'), dateSold: new Date('2024-03-15'), customerRef: 'CUST-Verma Retail' },
    { id: 'ser-3', productId: 'prod-1', productName: 'Samsung 55" Crystal 4K Smart TV', serialNumber: 'SAM55KLA003', imei: null, status: 'available', dateAdded: new Date('2024-01-15') },
    { id: 'ser-4', productId: 'prod-4', productName: 'Apple iPhone 15 (128GB, Black)', serialNumber: 'APLIP15A0001', imei: '356789012345001', status: 'available', dateAdded: new Date('2024-02-01') },
    { id: 'ser-5', productId: 'prod-5', productName: 'Samsung Galaxy S24 5G (256GB)', serialNumber: 'SAMGS24B0001', imei: '356789012345002', status: 'sold', dateAdded: new Date('2024-02-05'), dateSold: new Date('2024-07-15'), customerRef: 'CUST-Individual Sale' },
    { id: 'ser-6', productId: 'prod-5', productName: 'Samsung Galaxy S24 5G (256GB)', serialNumber: 'SAMGS24B0002', imei: '356789012345003', status: 'available', dateAdded: new Date('2024-02-05') },
  ];

  for (const s of serials) {
    await prisma.serial.upsert({
      where: { serialNumber: s.serialNumber },
      update: {},
      create: s,
    });
  }
  console.log('✔ Serials seeded');

  // 5. Users
  const users = [
    { id: 'user-1', name: 'Arjun Patel', email: 'admin@electrostock.demo', role: 'admin', phone: '+91 98200 12345', status: 'active' },
    { id: 'user-2', name: 'Neha Verma', email: 'manager@electrostock.demo', role: 'manager', phone: '+91 98200 54321', status: 'active' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: u,
    });
  }
  console.log('✔ Users seeded');

  // 6. Settings
  await prisma.settings.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      storeName: 'ElectroStock India',
      storeAddress: 'Shop 14-16, Electronic City, Bengaluru - 560100',
      storePhone: '+91 80 4123 4567',
      storeEmail: 'contact@electrostock.demo',
      gstNumber: '29ABCDE1234F1Z5',
      currencySymbol: '₹',
      lowStockAlert: 5,
      taxRate: 18,
      upiId: 'electrostock@okhdfcbank',
    },
  });
  console.log('✔ Settings initialized');

  const [prodCount, catCount, supCount, serCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.supplier.count(),
    prisma.serial.count(),
  ]);

  console.log(`\n🎉 Seed Complete! Counts: Products: ${prodCount}, Categories: ${catCount}, Suppliers: ${supCount}, Serials: ${serCount}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
