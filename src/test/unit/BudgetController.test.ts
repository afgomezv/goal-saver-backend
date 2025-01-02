import { createRequest, createResponse } from "node-mocks-http";
import { budgets } from "../mocks/Budgets";
import { BudgetController } from "../../controllers/BudgetController";
import Budget from "../../models/Budget";

jest.mock("../../models/Budget", () => ({
  findAll: jest.fn(),
}));

describe("BudgeController.getAll", () => {
  beforeEach(() => {
    (Budget.findAll as jest.Mock).mockReset();
    (Budget.findAll as jest.Mock).mockImplementation((options) => {
      const updateBudgets = budgets.filter(
        (budget) => budget.userId === options.where.userId
      );
      return Promise.resolve(updateBudgets);
    });
  });

  it("should retrieve 2 budgets for user with ID 1", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 1 },
    });

    const res = createResponse();

    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data.budgets).toHaveLength(2);
    expect(res.statusCode).toEqual(200);
    expect(res.status).not.toBe(404);
  });

  it("should retrieve 1 budgets for user with ID 2", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 2 },
    });

    const res = createResponse();

    // const updateBudgets = budgets.filter(
    //   (budget) => budget.userId === req.user.id
    // );

    // (Budget.findAll as jest.Mock).mockResolvedValue(updateBudgets);
    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data.budgets).toHaveLength(1);
    expect(res.statusCode).toEqual(200);
    expect(res.status).not.toBe(404);
  });

  it("should retrieve 0 budgets for user with ID 10", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 10 },
    });

    const res = createResponse();

    await BudgetController.getAll(req, res);

    const data = res._getJSONData();

    expect(data.budgets).toHaveLength(0);
    expect(res.statusCode).toEqual(200);
    expect(res.status).not.toBe(404);
  });

  it("should handle errors when fetching budgets", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets",
      user: { id: 100 },
    });

    const res = createResponse();

    (Budget.findAll as jest.Mock).mockRejectedValue(new Error());
    await BudgetController.getAll(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: "budgets can't found" });
  });
});
