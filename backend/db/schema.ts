import { mysqlTable, varchar, int, decimal, boolean, timestamp, text } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  birthday: varchar('birthday', { length: 50 }),
  isAdmin: boolean('is_admin').notNull().default(false),
  addresses: text('addresses'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  order: int('order').notNull(),
  visible: boolean('visible').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const dishes = mysqlTable('dishes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image: text('image').notNull(),
  category: varchar('category', { length: 255 }).notNull(),
  available: boolean('available').notNull().default(true),
  weight: varchar('weight', { length: 100 }),
  ingredients: text('ingredients'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  userName: varchar('user_name', { length: 255 }),
  userPhone: varchar('user_phone', { length: 50 }),
  items: text('items').notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  utensils: boolean('utensils').notNull().default(false),
  utensilsCount: int('utensils_count').notNull().default(0),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  deliveryType: varchar('delivery_type', { length: 100 }).notNull(),
  deliveryAddress: text('delivery_address'),
  deliveryTime: varchar('delivery_time', { length: 100 }),
  comments: text('comments'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  cancelReason: text('cancel_reason'),
  cancelledAt: timestamp('cancelled_at'),
  paymentStatus: varchar('payment_status', { length: 50 }),
  paymentId: varchar('payment_id', { length: 255 }),
  paymentUrl: text('payment_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const restaurant = mysqlTable('restaurant', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  workingHours: varchar('working_hours', { length: 255 }).notNull(),
  deliveryTime: varchar('delivery_time', { length: 255 }).notNull(),
  pickupTime: varchar('pickup_time', { length: 255 }).notNull(),
  deliveryMinTime: int('delivery_min_time').notNull(),
  deliveryMaxTime: int('delivery_max_time').notNull(),
  pickupMinTime: int('pickup_min_time').notNull(),
  pickupMaxTime: int('pickup_max_time').notNull(),
  logo: text('logo'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const smsCodes = mysqlTable('sms_codes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  phone: varchar('phone', { length: 50 }).notNull(),
  code: varchar('code', { length: 10 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
