import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";

export const validateUserInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name").notEmpty().withMessage("Name is required").run(req);
  await body("email").isEmail().withMessage("Email is not valid").run(req);
  await body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .run(req);

  next();
};

export const validateTokenInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token is  not valid")
    .run(req);

  next();
};

export const validateloginInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("email").isEmail().withMessage("Email is not valid").run(req);
  await body("password")
    .notEmpty()
    .withMessage("Password is required")
    .run(req);

  next();
};
