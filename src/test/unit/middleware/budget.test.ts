import { createRequest, createResponse } from "node-mocks-http";
import { hasAccess, validateBudgeExists } from "../../../middleware/budget";
import Budget from "../../../models/Budget";
import { budgets } from "../../mocks/Budgets";

jest.mock("../../../models/Budget.ts", () => ({
  findByPk: jest.fn(),
}));

describe("budget Middleware - validateBudgeExists", () => {
  it("Should handle non-existing budget", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(null);

    const req = createRequest({
      params: {
        budgetId: 1,
      },
    });
    const res = createResponse();

    const next = jest.fn();

    await validateBudgeExists(req, res, next);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "Budget not found with ID: 1" });
    expect(next).not.toHaveBeenCalled();
  });

  it("Should proceed to next middleware if budget exists", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);

    const req = createRequest({
      params: {
        budgetId: 1,
      },
    });
    const res = createResponse();
    const next = jest.fn();

    await validateBudgeExists(req, res, next);
    //const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(next).toHaveBeenCalled();
    expect(req.budget).toEqual(budgets[0]);
  });

  it("Should handle non-existing budget", async () => {
    (Budget.findByPk as jest.Mock).mockRejectedValue(new Error());

    const req = createRequest({
      params: {
        budgetId: 1,
      },
    });
    const res = createResponse();

    const next = jest.fn();

    await validateBudgeExists(req, res, next);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(500);
    expect(data).toEqual({
      error: "An error occurred while retrieving the budget with ID: 1",
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("budget Middleware - hasAccess", () => {
  it("Should call next() if user has access to budget", () => {
    const req = createRequest({
      budget: budgets[0],
      user: { id: 1 },
    });

    const res = createResponse();
    const next = jest.fn();

    hasAccess(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("Should return 401 error if userId doesn't have access to budget", () => {
    const req = createRequest({
      budget: budgets[0],
      user: { id: 2 },
    });

    const res = createResponse();
    const next = jest.fn();

    hasAccess(req, res, next);
    const data = res._getJSONData();

    expect(res.statusCode).toBe(401);
    expect(data).toEqual({ error: "Unauthorized access" });
    expect(next).not.toHaveBeenCalled();
  });
});
