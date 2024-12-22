import { Router } from "express";
import { AuthController } from "../controllers/AuthControllers";
import {
  validateloginInput,
  validateTokenInput,
  validateUserInput,
} from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";
import { limiter } from "../config/limit";

const router = Router();

router.use(limiter);

router.post(
  "/register",
  validateUserInput,
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  validateTokenInput,
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  validateloginInput,
  handleInputErrors,
  AuthController.login
);

export default router;
