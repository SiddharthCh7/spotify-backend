import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express';
import fileUpload from 'express-fileupload'

import { connectDB } from './lib/db.js';

import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import songRoutes from './routes/song.route.js';
import albumRoutes from './routes/album.route.js';
import statRoutes from './routes/stat.route.js';
import searchRoutes from './routes/search.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

console.log("Frotend Port: ",process.env.OriginPort)

const __dirname = path.resolve();

app.use(cors(
  {
    origin: process.env.OriginPort,
    credentials: true
  }
));
app.use(express.json());
app.use(clerkMiddleware());
app.use(fileUpload({
  useTempFiles: false,
  tempFileDir: path.join(__dirname, "tmp"),
  createParentPath: true,
  limits:{
    fileSize: 10 * 1024 * 1024 // 10mb => max file size
  }
}));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

app.use("/api/search", searchRoutes);

//error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
