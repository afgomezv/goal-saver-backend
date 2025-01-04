import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { ExpensesController } from "../../../controllers/ExpenseController";
import { expenses } from "../../mocks/Expense";

jest.mock("../../../models/Expense.ts", () => ({
  create: jest.fn(),
}));

describe("ExpenseController.create", () => {
  it("Should create a new expense", async () => {
    const expenseMock = {
      save: jest.fn(),
    };

    (Expense.create as jest.Mock).mockResolvedValue(expenseMock);

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expense",
      body: {
        name: "Test expense",
        amount: 500,
      },
      budget: { id: 1 },
    });

    const res = createResponse();
    await ExpensesController.create(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data.message).toEqual("Expense created successfully");
    expect(expenseMock.save).toHaveBeenCalled();
    expect(expenseMock.save).toHaveBeenCalledTimes(1);
    expect(Expense.create).toHaveBeenCalledWith(req.body);
  });

  it("should handle expense creation error", async () => {
    const expenseMock = {
      save: jest.fn(),
    };

    (Expense.create as jest.Mock).mockRejectedValue(new Error()); //linea 44

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "Test Expense", amount: 500 },
      budget: { id: 1 },
    });
    const res = createResponse();

    await ExpensesController.create(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(500);
    expect(data).toEqual({ error: "expense can't create" });
    expect(expenseMock.save).not.toHaveBeenCalled();
    expect(Expense.create).toHaveBeenCalledWith(req.body);
  });
});

describe("ExpenseController.getById", () => {
  it("Should return expense with ID 1", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenses[0],
    });

    const res = createResponse();
    await ExpensesController.getById(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.expense).toEqual(expenses[0]);
    expect(data.message).toEqual("Expense retrieved successfully");
  });
});

describe("ExpenseController.updateById", () => {
  it("Should update expense and return json", async () => {
    const expenseMock = {
      ...expenses[0],
      update: jest.fn(),
    };

    const req = createRequest({
      method: "PUT",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock,
      body: {
        name: "Updated Test expense",
        amount: 100,
      },
    });

    const res = createResponse();
    await ExpensesController.updateById(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.message).toEqual("Expense updated successfully");
    expect(expenseMock.update).toHaveBeenCalled();
    expect(expenseMock.update).toHaveBeenCalledTimes(1);
    expect(expenseMock.update).toHaveBeenCalledWith(req.body);
  });
});

describe("ExpenseController.deleteById", () => {
  it("Should delete expense and return a success message", async () => {
    const expenseMock = {
      ...expenses[0],
      destroy: jest.fn(),
    };

    const req = createRequest({
      method: "DELETE",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock,
    });

    const res = createResponse();
    await ExpensesController.deleteById(req, res);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.message).toEqual("Expense deleted successfully");
    expect(expenseMock.destroy).toHaveBeenCalled();
    expect(expenseMock.destroy).toHaveBeenCalledTimes(1);
  });
});
