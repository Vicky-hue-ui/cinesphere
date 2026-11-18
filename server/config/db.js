const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js / Windows DNS SRV lookup issues with MongoDB Atlas (querySrv EBADRESP / ENOTFOUND)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn('\n⚠️  [DATABASE NOTICE] MONGO_URI is not defined in server/.env');
    console.warn('   CineChat AI, Review Synthesizer, and TMDB features will run normally.');
    console.warn('   To enable authentication, watch diary, and reviews, add MONGO_URI to server/.env\n');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Server will remain running, but database features will return 503 until connection succeeds.\n');
  }
};

module.exports = connectDB;
