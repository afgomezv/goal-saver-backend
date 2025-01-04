import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { ExpensesController } from "../../../controllers/ExpenseController";

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

  it("Should handle expense creation error", async () => {
    const expenseMock = {
      save: jest.fn(),
    };

    (Expense.create as jest.Mock).mockRejectedValue(new Error());

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

    expect(res.statusCode).toBe(500);
    expect(data).toEqual({ error: "expense can't create" });
    expect(expenseMock.save).not.toHaveBeenCalled();
    expect(Expense.create).toHaveBeenCalledWith(req.body);
  });
});
