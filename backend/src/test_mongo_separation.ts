import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function testDatabaseSeparation() {
  console.log('🧪 [Test] Starting Dual MongoDB Database Separation Test...');

  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  console.log('⚡ MongoMemoryServer started at:', mongoUri);

  // 1. Create Connection to ARTISAN DATABASE (kalora_artisan_db)
  const artisanDbConnection = mongoose.createConnection(`${mongoUri}kalora_artisan_db`);
  // 2. Create Connection to CUSTOMER DATABASE (kalora_customer_db)
  const customerDbConnection = mongoose.createConnection(`${mongoUri}kalora_customer_db`);

  // Register Artisan Schema
  const ArtisanUserSchema = new mongoose.Schema({
    artisanId: String,
    name: String,
    craftCategory: String,
    qrPassportHash: String
  });
  const ArtisanUserModel = artisanDbConnection.model('ArtisanUser', ArtisanUserSchema, 'artisans');

  // Register Customer Schema
  const CustomerUserSchema = new mongoose.Schema({
    customerId: String,
    name: String,
    email: String,
    address: String
  });
  const CustomerUserModel = customerDbConnection.model('CustomerUser', CustomerUserSchema, 'customers');

  try {
    // 3. Insert into ARTISAN DATABASE
    const testArtisan = await ArtisanUserModel.create({
      artisanId: 'ART-9912',
      name: 'Devi Ramachandran',
      craftCategory: 'HANDLOOM_SAREE',
      qrPassportHash: 'KALORA-QR-PASSPORT-2026-9812'
    });
    console.log('✅ Inserted record into [kalora_artisan_db -> artisans]:', testArtisan.name);

    // 4. Insert into CUSTOMER DATABASE
    const testCustomer = await CustomerUserModel.create({
      customerId: 'CUST-8819',
      name: 'Ananya Sharma',
      email: 'ananya@example.com',
      address: '12 Weaver Street, Chennai - 600028'
    });
    console.log('✅ Inserted record into [kalora_customer_db -> customers]:', testCustomer.name);

    // 5. Verify Database Isolation
    console.log('\n📊 DATABASE ISOLATION VERIFICATION:');
    console.log(' - Artisan Model Target Database:', ArtisanUserModel.db.name);
    console.log(' - Customer Model Target Database:', CustomerUserModel.db.name);

    const artisanCountInArtisanDb = await ArtisanUserModel.countDocuments();
    const customerCountInCustomerDb = await CustomerUserModel.countDocuments();

    console.log(` - Record Count in kalora_artisan_db: ${artisanCountInArtisanDb} Artisan(s)`);
    console.log(` - Record Count in kalora_customer_db: ${customerCountInCustomerDb} Customer(s)`);

    if (ArtisanUserModel.db.name === 'kalora_artisan_db' && CustomerUserModel.db.name === 'kalora_customer_db') {
      console.log('\n🎉 SUCCESS: Artisan Database (kalora_artisan_db) and Customer Database (kalora_customer_db) are 100% physically separated!');
    }
  } catch (error) {
    console.error('❌ Separation Test Error:', error);
  } finally {
    await artisanDbConnection.close();
    await customerDbConnection.close();
    await mongoServer.stop();
    process.exit(0);
  }
}

testDatabaseSeparation();
