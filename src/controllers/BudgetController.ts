import type { Request, Response } from "express";
import Budget from "../models/Budget";

export class BudgetController {
  static getAll = async (req: Request, res: Response) => {
    try {
      const budgets = await Budget.findAll({
        order: [["createdAt", "DESC"]],
        // TODO: Filtrar por el usuario autenticado
      });
      res.json({ budgets });
    } catch (error) {
      //console.log(error);
      res.status(500).json({ error: "budgets can't found " });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const budget = new Budget(req.body);
      await budget.save();
      res.status(201).json({
        message: "budget created successfully",
        data: budget,
      });
    } catch (error) {
      //console.log(error);
      res.status(500).json({ error: "budget can't create" });
    }
  };

  static getById = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json(req.budget);
  };

  static updatetById = async (req: Request, res: Response) => {
    await req.budget.update(req.body);
    res.status(200).json({
      message: "budget updated successfully",
      data: req.budget,
    });
  };

  static deletetById = async (req: Request, res: Response) => {
    await req.budget.destroy();
    res.status(200).json({
      message: "budget deleted successfully",
      data: req.budget,
    });
  };
}
