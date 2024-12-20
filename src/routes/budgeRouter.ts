import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";

import {
  validateBudgeExists,
  validateBudgetInput,
  validateBudgetId,
} from "../middleware/budget";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.param("budgetId", validateBudgetId);
router.param("budgetId", validateBudgeExists);

router.get("/", BudgetController.getAll);

router.post(
  "/",
  validateBudgetInput,
  handleInputErrors,
  BudgetController.create
);

router.get("/:budgetId", BudgetController.getById);

router.put(
  "/:budgetId",
  validateBudgetInput,
  handleInputErrors,
  BudgetController.updatetById
);

router.delete("/:budgetId", BudgetController.deletetById);

export default router;
