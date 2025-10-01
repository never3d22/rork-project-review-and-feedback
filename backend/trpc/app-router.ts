import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import dishesGetAll from "./routes/dishes/get-all";
import dishesCreate from "./routes/dishes/create";
import dishesUpdate from "./routes/dishes/update";
import dishesDelete from "./routes/dishes/delete";
import ordersGetAll from "./routes/orders/get-all";
import ordersCreate from "./routes/orders/create";
import ordersUpdateStatus from "./routes/orders/update-status";
import categoriesGetAll from "./routes/categories/get-all";
import restaurantGet from "./routes/restaurant/get";
import restaurantUpdate from "./routes/restaurant/update";
import authLoginAdmin from "./routes/auth/login-admin";
import authSendSms from "./routes/auth/send-sms";
import authVerifySms from "./routes/auth/verify-sms";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  dishes: createTRPCRouter({
    getAll: dishesGetAll,
    create: dishesCreate,
    update: dishesUpdate,
    delete: dishesDelete,
  }),
  orders: createTRPCRouter({
    getAll: ordersGetAll,
    create: ordersCreate,
    updateStatus: ordersUpdateStatus,
  }),
  categories: createTRPCRouter({
    getAll: categoriesGetAll,
  }),
  restaurant: createTRPCRouter({
    get: restaurantGet,
    update: restaurantUpdate,
  }),
  auth: createTRPCRouter({
    loginAdmin: authLoginAdmin,
    sendSms: authSendSms,
    verifySms: authVerifySms,
  }),
});

export type AppRouter = typeof appRouter;
