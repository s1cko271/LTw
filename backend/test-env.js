// Test file to check environment variables
require('dotenv').config();

console.log('Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Try to connect to MongoDB
const mongoose = require('mongoose');

// Chuỗi kết nối MongoDB Atlas cố định
const MONGODB_URI = 'mongodb+srv://bp27:bp2712003@cluster0.2a6pk6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(process.env.MONGODB_URI || MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Đã kết nối với MongoDB'))
.catch(err => console.error('❌ Lỗi kết nối MongoDB:', err)); 