import { ArtisanUserModel } from './models/ArtisanModels';
import { CustomerUserModel } from './models/CustomerModels';
import { artisanDbConnection, customerDbConnection } from './config/mongoConnections';

async function testAtlasCloudSeparation() {
  console.log('⚡ [MongoDB Atlas] Connecting to live Atlas Cluster...');

  try {
    // 1. Test insertion into Cloud kalora_artisan_db
    const atlasArtisan = await ArtisanUserModel.create({
      artisanId: `ART-ATLAS-${Date.now()}`,
      name: 'Devi Ramachandran (Kanchipuram Silk)',
      email: 'devi.atlas@kalora.org',
      phone: '9840199999',
      location: 'Kanchipuram, Tamil Nadu',
      craftCategory: 'HANDLOOM_SAREE',
      qrPassportHash: 'KALORA-ATLAS-QR-PASSPORT-2026-9812',
      qrPassportValidUntil: '2031-09-21'
    });

    console.log('✅ Created cloud record in [kalora_artisan_db -> artisans]:', atlasArtisan.name);

    // 2. Test insertion into Cloud kalora_customer_db
    const atlasCustomer = await CustomerUserModel.create({
      customerId: `CUST-ATLAS-${Date.now()}`,
      name: 'Ananya Sharma',
      email: 'ananya.atlas@kalora.org',
      address: '12 Weaver Street, Chennai - 600028'
    });

    console.log('✅ Created cloud record in [kalora_customer_db -> customers]:', atlasCustomer.name);

    console.log('\n📊 MONGODB ATLAS SEPARATION SUMMARY:');
    console.log(' - Artisan Model Connected DB:', ArtisanUserModel.db.name);
    console.log(' - Customer Model Connected DB:', CustomerUserModel.db.name);

    if (ArtisanUserModel.db.name === 'kalora_artisan_db' && CustomerUserModel.db.name === 'kalora_customer_db') {
      console.log('\n🎉 SUCCESS: Live MongoDB Atlas Cluster is storing Artisan and Customer data in separate databases!');
    }
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Error:', error);
  } finally {
    await artisanDbConnection.close();
    await customerDbConnection.close();
    process.exit(0);
  }
}

testAtlasCloudSeparation();
