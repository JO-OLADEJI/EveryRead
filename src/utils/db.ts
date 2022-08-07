import mongoose from "mongoose";
import "dotenv/config";

const DB_URI: string | undefined = process.env.DB_URI;
if (!DB_URI) {
  throw new Error("DB_URI .env variable not defined!");
}

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URI);
    console.log("Connected to DB ✓");
  } catch (error) {
    console.error(error);
  }
};

export default connectToDatabase;
