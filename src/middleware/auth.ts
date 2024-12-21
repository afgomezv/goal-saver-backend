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
