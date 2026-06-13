import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Feature Routes
import { authRouter } from './features/auth/routes/auth.routes.js';
import { productRouter } from './features/inventory/routes/inventory.routes.js';
import { bomRouter, manufacturingRouter } from './features/operations/routes/operations.routes.js';
import { salesRouter } from './features/sales/routes/sales.routes.js';
import { purchaseRouter, vendorRouter } from './features/procurement/routes/procurement.routes.js';
import { configRouter, requestRouter } from './features/admin/routes/admin.routes.js';
import { financeRouter } from './features/analytics/routes/analytics.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/boms', bomRouter);
app.use('/api/sales', salesRouter);
app.use('/api/purchase', purchaseRouter);
app.use('/api/manufacturing', manufacturingRouter);
app.use('/api/config', configRouter);
app.use('/api/requests', requestRouter);
app.use('/api/vendors', vendorRouter);
app.use('/api/finance', financeRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
