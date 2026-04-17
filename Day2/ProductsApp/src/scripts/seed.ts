import mongoose from "mongoose";
import { connectDb, disconnectDb } from "../config/db";
import { env } from "../config/env";
import { ProductModel, productCategories } from "../models/Product";
import { UserModel } from "../models/User";

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeEmail(i: number) {
  return `user${i}@test.com`;
}

async function main() {
  await connectDb(env.mongoUri);

  await Promise.all([UserModel.deleteMany({}), ProductModel.deleteMany({})]);

  const userCount = 100;
  const productCount = 900;

  const users = Array.from({ length: userCount }).map((_, i) => ({
    firstName: `User${i + 1}`,
    lastName: `Test${(i % 20) + 1}`,
    email: makeEmail(i + 1),
    password: "Password@123"
  }));

  const createdUsers = await UserModel.insertMany(users, { ordered: false });
  const userIds = createdUsers.map((u) => u._id);

  const products = Array.from({ length: productCount }).map((_, i) => {
    const category = pick(productCategories);
    const price = randInt(50, 50000);
    const stock = randInt(0, 200);

    return {
      name: `${category.toUpperCase()} Product ${i + 1}`,
      description: `This is a ${category} product with price ${price} and stock ${stock}. Built for seed testing.`,
      category,
      price,
      currency: "INR" as const,
      rating: Math.round(Math.random() * 50) / 10,
      stock,
      ownerId: pick(userIds)
    };
  });

  await ProductModel.insertMany(products, { ordered: false });

  const total = await Promise.all([UserModel.countDocuments(), ProductModel.countDocuments()]);
  const inserted = total[0] + total[1];

  console.log(
    JSON.stringify({ users: total[0], products: total[1], totalRecords: inserted, mongoUri: env.mongoUri })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await disconnectDb();
  });

