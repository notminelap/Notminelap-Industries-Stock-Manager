import { z } from 'zod';

export const itemSchema = z.object({
  id: z.string().optional(),
  model: z.string().min(1, 'Model is required').max(100),
  color: z.string().min(1, 'Color is required').max(50),
  description: z.string().max(500).default(''),
  quantity: z.coerce.number().int().min(0, 'Quantity must be 0 or more'),
  image: z.string().max(10 * 1024 * 1024, 'Image too large').default(''), // 10MB base64 max
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
});

export const transactionSchema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  partyName: z.string().min(1, 'Party name is required').max(100),
  date: z.string().min(1, 'Date is required'),
  address: z.string().min(1, 'Address is required').max(500),
  billingNumber: z.string().min(1, 'Billing number is required').max(50),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(100),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['admin', 'manager', 'staff']).default('staff'),
});

// Middleware factory
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
      });
    }
    req.body = result.data; // use parsed/cleaned data
    next();
  };
}
