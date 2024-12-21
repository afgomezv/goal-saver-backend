import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import Expense from "../models/Expense";

declare global {
  namespace Express {
    interface Request {
      expense?: Expense;
    }
  }
}

export const validateExpenseInput = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await body("name")
    .notEmpty()
    .withMessage("Name of expense is required")
    .run(req);
  await body("amount")
    .notEmpty()
    .withMessage("Amount of expense is required")
    .isNumeric()
    .withMessage("Amount of expense must be a number")
    .custom((value) => value > 0)
    .withMessage("Amount of expense must be greater than zero")
    .run(req);

  next();
};

export const validateExpenseId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await param("expenseId")
    .isInt()
    .custom((value) => value > 0)
    .withMessage("Expense ID must be a positive integer")
    .run(req);

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  next();
};

export const validateExpenseExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { expenseId } = req.params;
  try {
    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      res.status(404).json({ error: `Budget not found with ID: ${expenseId}` });
      return;
    }

    req.expense = expense;

    next();
  } catch (error) {
    res.status(500).json({
      error: `An error occurred while retrieving the budget with ID: ${expenseId}`,
    });
  }
};
