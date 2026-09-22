import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

const prisma = new PrismaClient();

async function syncAllDataToMongo() {
  console.log('🔄 Syncing all registered users & products to local MongoDB...');

  const artisanConn = mongoose.createConnection('mongodb://127.0.0.1:27017/kalora_artisan_db');
  const customerConn = mongoose.createConnection('mongodb://127.0.0.1:27017/kalora_customer_db');

  const Artisan = artisanConn.model('Artisan', new mongoose.Schema({}, { strict: false }), 'artisans');
  const Product = artisanConn.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
  const Customer = customerConn.model('Customer', new mongoose.Schema({}, { strict: false }), 'customers');

  const users = await prisma.user.findMany();
  const products = await prisma.product.findMany();

  for (const user of users) {
    if (user.role === 'ARTISAN') {
      await Artisan.updateOne(
        { id: user.id },
        { $set: { ...user, artisanId: user.id, craftCategory: 'Handloom & Pottery' } },
        { upsert: true }
      );
      console.log(`✅ Synced Registered Artisan: ${user.name || user.id} (${user.phone || 'No phone'})`);
    } else {
      await Customer.updateOne(
        { id: user.id },
        { $set: { ...user, customerId: user.id } },
        { upsert: true }
      );
      console.log(`✅ Synced Registered Customer: ${user.name || user.id}`);
    }
  }

  for (const product of products) {
    await Product.updateOne(
      { id: product.id },
      { $set: { ...product } },
      { upsert: true }
    );
  }

  console.log(`🎉 Synced ${users.length} user(s) and ${products.length} product(s) into local MongoDB!`);

  await artisanConn.close();
  await customerConn.close();
  await prisma.$disconnect();
  process.exit(0);
}

syncAllDataToMongo();
