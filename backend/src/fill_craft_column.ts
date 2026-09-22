import mongoose from 'mongoose';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/kalora_artisan_db');
  const db = mongoose.connection.db;
  if (!db) {
    console.error('No DB');
    process.exit(1);
  }
  const collection = db.collection('artisans');
  const docs = await collection.find({}).toArray();

  for (const d of docs) {
    const cat = d.craftCategory || 'HANDLOOM_SAREE';
    let craftText = 'Handloom Pure Silk Saree';
    if (cat === 'POTTERY') craftText = 'Terracotta Clay Pottery';
    else if (cat === 'FURNITURE' || cat === 'WOODWORK') craftText = 'Carved Woodcraft Shrine';

    await collection.updateOne(
      { _id: d._id },
      { $set: { craft: d.craft || craftText } }
    );
  }

  console.log('Successfully filled the craft column on all artisan documents!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
