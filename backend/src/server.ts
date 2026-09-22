import app from "./app";
import { config } from "./config/env";
import { connectDB } from "./config/database";

async function main() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 KALORA Backend server running on port ${config.port}`);
  });
}

main();
