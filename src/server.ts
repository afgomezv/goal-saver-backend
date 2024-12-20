import express from "express";
import colors from "colors";
import morgan from "morgan";
import { db } from "./config/db";
import budgetRouter from "./routes/budgeRouter";

async function connectDB() {
  try {
    await db.authenticate();
    db.sync();
    console.log(colors.magenta.bold("Connecting to database successfully"));
  } catch (error) {
    console.log(colors.red.bold("Error connecting to database"));
  }
}

connectDB();

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/budgets", budgetRouter);

export default app;
