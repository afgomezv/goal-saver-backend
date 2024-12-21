import type { Request, Response } from "express";
import Expense from "../models/Expense";

export class ExpensesController {
  static create = async (req: Request, res: Response) => {
    try {
      const expense = new Expense(req.body);
      expense.budgetId = req.budget.id;
      await expense.save();
      res.status(201).json({
        message: "Expense created successfully",
        expense,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "expense can't create" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    res.status(200).json({
      message: "Expense retrieved successfully",
      expense: req.expense,
    });
  };

  static updateById = async (req: Request, res: Response) => {
    await req.expense.update(req.body);
    res.status(200).json({
      message: "Expense updated successfully",
      expense: req.expense,
    });
  };

  static deleteById = async (req: Request, res: Response) => {
    await req.expense.destroy();
    res.status(200).json({ message: "Expense deleted successfully" });
  };
}
