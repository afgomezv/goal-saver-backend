import { Router } from "express";
import { BudgetController } from "../controllers/BudgetController";
import { ExpensesController } from "../controllers/ExpenseController";
import {
  hasAccess,
  validateBudgeExists,
  validateBudgetId,
  validateBudgetInput,
} from "../middleware/budget";
import {
  belongsToBudget,
  validateExpenseExists,
  validateExpenseId,
  validateExpenseInput,
} from "../middleware/expense";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

//*  Roytes for  budgets *//

router.param("budgetId", validateBudgetId);
router.param("budgetId", validateBudgeExists);
router.param("budgetId", hasAccess);

router.param("expenseId", validateExpenseId);
router.param("expenseId", validateExpenseExists);
router.param("expenseId", belongsToBudget);

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
  BudgetController.updateById
);

router.delete("/:budgetId", BudgetController.deleteById);

//*  Roytes for  expenses *//

router.post(
  "/:budgetId/expenses",
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.create
);

router.get("/:budgetId/expenses/:expenseId", ExpensesController.getById);

router.put(
  "/:budgetId/expenses/:expenseId",
  validateBudgetInput,
  handleInputErrors,
  ExpensesController.updateById
);

router.delete("/:budgetId/expenses/:expenseId", ExpensesController.deleteById);

export default router;
