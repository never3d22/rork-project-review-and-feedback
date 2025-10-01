import { db } from './client';
import { dishes, categories, restaurant } from './schema';
import { MOCK_DISHES, MOCK_CATEGORIES } from '../../constants/dishes';

async function seed() {
  console.log('Seeding database...');
  
  console.log('Inserting categories...');
  for (const category of MOCK_CATEGORIES) {
    await db.insert(categories).values(category).onConflictDoNothing();
  }
  
  console.log('Inserting dishes...');
  for (const dish of MOCK_DISHES) {
    await db.insert(dishes).values({
      ...dish,
      ingredients: dish.ingredients ? JSON.stringify(dish.ingredients) : undefined,
    }).onConflictDoNothing();
  }
  
  console.log('Inserting restaurant info...');
  await db.insert(restaurant).values({
    id: '1',
    name: 'Вкусная еда',
    address: 'ул. Пушкина, д. 10',
    phone: '+7 (999) 123-45-67',
    workingHours: '10:00 - 22:00',
    deliveryTime: '30-45 мин',
    pickupTime: '25-35 мин',
    deliveryMinTime: 30,
    deliveryMaxTime: 45,
    pickupMinTime: 25,
    pickupMaxTime: 35,
    logo: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/i3drirnswip2jkkao4snr',
  }).onConflictDoNothing();
  
  console.log('Seeding completed!');
}

seed().catch(console.error);
