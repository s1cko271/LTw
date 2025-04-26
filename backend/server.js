// Server chính cho Daily Quest Hub Backend
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const questRoutes = require('./routes/questRoutes');
const achievementRoutes = require('./routes/achievementRoutes');

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-quest-hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Đã kết nối với MongoDB'))
.catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/achievements', achievementRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.send('API Daily Quest Hub đang hoạt động');
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});