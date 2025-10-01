import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  birthday: text('birthday'),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  addresses: text('addresses'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  order: integer('order').notNull(),
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const dishes = sqliteTable('dishes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  image: text('image').notNull(),
  category: text('category').notNull(),
  available: integer('available', { mode: 'boolean' }).notNull().default(true),
  weight: text('weight'),
  ingredients: text('ingredients'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userName: text('user_name'),
  userPhone: text('user_phone'),
  items: text('items').notNull(),
  total: real('total').notNull(),
  utensils: integer('utensils', { mode: 'boolean' }).notNull().default(false),
  utensilsCount: integer('utensils_count').notNull().default(0),
  paymentMethod: text('payment_method').notNull(),
  deliveryType: text('delivery_type').notNull(),
  deliveryAddress: text('delivery_address'),
  deliveryTime: text('delivery_time'),
  comments: text('comments'),
  status: text('status').notNull().default('pending'),
  cancelReason: text('cancel_reason'),
  cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
  paymentStatus: text('payment_status'),
  paymentId: text('payment_id'),
  paymentUrl: text('payment_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const restaurant = sqliteTable('restaurant', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  workingHours: text('working_hours').notNull(),
  deliveryTime: text('delivery_time').notNull(),
  pickupTime: text('pickup_time').notNull(),
  deliveryMinTime: integer('delivery_min_time').notNull(),
  deliveryMaxTime: integer('delivery_max_time').notNull(),
  pickupMinTime: integer('pickup_min_time').notNull(),
  pickupMaxTime: integer('pickup_max_time').notNull(),
  logo: text('logo'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const smsCodes = sqliteTable('sms_codes', {
  id: text('id').primaryKey(),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
