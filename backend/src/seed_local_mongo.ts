import mongoose from 'mongoose';

async function createLocalDatabases() {
  console.log('⚡ Creating local MongoDB databases...');

  const artisanConn = mongoose.createConnection('mongodb://127.0.0.1:27017/kalora_artisan_db');
  const customerConn = mongoose.createConnection('mongodb://127.0.0.1:27017/kalora_customer_db');

  const Artisan = artisanConn.model('Artisan', new mongoose.Schema({ artisanId: String, name: String, craft: String }), 'artisans');
  const Customer = customerConn.model('Customer', new mongoose.Schema({ customerId: String, name: String, email: String }), 'customers');

  await Artisan.create({ artisanId: 'ART-101', name: 'Devi Ramachandran', craft: 'Handloom Saree' });
  await Customer.create({ customerId: 'CUST-201', name: 'Ananya Sharma', email: 'ananya@example.com' });

  console.log('✅ Created kalora_artisan_db and kalora_customer_db successfully!');
  await artisanConn.close();
  await customerConn.close();
  process.exit(0);
}

createLocalDatabases();
