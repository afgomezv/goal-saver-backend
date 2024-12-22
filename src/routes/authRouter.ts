import { Router } from "express";
import { limiter } from "../config/limit";
import { AuthController } from "../controllers/AuthControllers";
import {
  validateForgotPassword,
  validateLoginInput,
  validateTokenInput,
  validateTokenReset,
  validateUserInput,
} from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";

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
  validateLoginInput,
  handleInputErrors,
  AuthController.login
);

router.post(
  "/forgot-password",
  validateForgotPassword,
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  validateTokenInput,
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/reset-password/:token",
  validateTokenReset,
  handleInputErrors,
  AuthController.resetPasswordWithToken
);

export default router;
