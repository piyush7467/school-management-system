import bcrypt from "bcryptjs";
import { Admin } from "../models/adminModel.js";



export const seedAdmin = async () => {
  const exists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (!exists && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await Admin.create({
      username: process.env.ADMIN_USERNAME,
      name: "Piyush",
      password: hashedPassword
    });

    console.log("✅ First admin created!");
  }
};
