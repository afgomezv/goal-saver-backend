import { exit } from "node:process";
import { db } from "../config/db";
import { log } from "node:console";

const clearData = async () => {
  try {
    await db.sync({ force: true });
    log("Database cleared successfully");
    exit(0);
  } catch (error) {
    //console.log(error);
    exit(1);
  }
};

if (process.argv[2] === "--clear") {
  clearData();
}
