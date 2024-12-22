import { Router } from "express";
import { AuthController } from "../controllers/AuthControllers";
import { validateTokenInput, validateUserInput } from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limit";

const router = Router();

router.post(
  "/register",
  validateUserInput,
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  limiter,
  validateTokenInput,
  handleInputErrors,
  AuthController.confirmAccount
);

export default router;
