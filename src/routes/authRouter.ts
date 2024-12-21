import { Router } from "express";
import { AuthController } from "../controllers/AuthControllers";
import { validateUserInput } from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.post(
  "/register",
  validateUserInput,
  handleInputErrors,
  AuthController.createAccount
);

export default router;
