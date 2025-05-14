// Server chính cho Daily Quest Hub Backend
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const questRoutes = require('./routes/questRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const toolRoutes = require('./routes/toolRoutes');

// Thiết lập biến môi trường nếu không tìm thấy .env
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'daily_quest_hub_secret_key';
  process.env.JWT_EXPIRES_IN = '90d';
}

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Chuỗi kết nối MongoDB Atlas cố định
const MONGODB_URI = 'mongodb+srv://bp27:bp2712003@cluster0.2a6pk6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Kết nối MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Đã kết nối với MongoDB'))
.catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/tools', toolRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.send('API Daily Quest Hub đang hoạt động');
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});