import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { verifyJWT } from "../utils/jwt";
import User from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

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
    .isLength({ min: 6, max: 6 })
    .withMessage("Token is  not valid")
    .run(req);

  next();
};

export const validateLoginInput = async (
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

export const validateForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("email").isEmail().withMessage("Email is not valid").run(req);

  next();
};

export const validateTokenReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token is not valid")
    .run(req);
  await body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .run(req);

  next();
};

export const validateUpdatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("current_password")
    .notEmpty()
    .withMessage("Password is required")
    .run(req);
  await body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .run(req);

  next();
};

export const validateCheckPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("password")
    .notEmpty()
    .withMessage("Password is required")
    .run(req);

  next();
};

export const validateUpdateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name").notEmpty().withMessage("Name is required").run(req);
  await body("email").isEmail().withMessage("Email is not valid").run(req);

  next();
};

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = verifyJWT(token);
    if (typeof decoded === "object" && decoded.id) {
      req.user = await User.findByPk(decoded.id, {
        attributes: ["id", "name", "email"],
      });

      next();
    }
  } catch (error) {
    res.status(500).json({ error: "Token invalid" });
  }
};
