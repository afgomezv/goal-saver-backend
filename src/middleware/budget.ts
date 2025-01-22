import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import Budget from "../models/Budget";

declare global {
  namespace Express {
    interface Request {
      budget?: Budget;
    }
  }
}

export const validateBudgetId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("budgetId")
    .isInt()
    .withMessage("ID must be a number")
    .bail() // testings error
    .custom((value) => value > 0)
    .withMessage("ID must be greater than zero")
    .bail() // testings error
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};

export const validateBudgetInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name").notEmpty().withMessage("Name is required").run(req);
  await body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => value > 0)
    .withMessage("Amount must be greater than zero")
    .run(req);

  next();
};

export const validateBudgeExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { budgetId } = req.params;
  try {
    const budget = await Budget.findByPk(budgetId);

    if (!budget) {
      res.status(404).json({ error: `Budget not found with ID: ${budgetId}` });
      return;
    }

    req.budget = budget;

    next();
  } catch (error) {
    res.status(500).json({
      error: `An error occurred while retrieving the budget with ID: ${budgetId}`,
    });
  }
};

export const hasAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.budget.userId !== req.user.id) {
    res.status(401).json({ error: "Unauthorized access" });
    return;
  }
  next();
};
