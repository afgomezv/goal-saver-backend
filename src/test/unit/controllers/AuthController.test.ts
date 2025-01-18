import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthControllers";
import User from "../../../models/User";
import { hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../email/AuthEmail";

jest.mock("../../../models/User.ts"); // mock automatically
jest.mock("../../../utils/auth");
jest.mock("../../../utils/token");

describe("AuthController.createAccount", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return a 409 status and an error message if the email is already registered", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(true);

    const req = createRequest({
      method: "POST",
      url: "api/auth/register",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });

    const res = createResponse();
    await AuthController.createAccount(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(409);
    expect(data).toHaveProperty("error", "Email already in use");
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("Should register a new user and return a success message", async () => {
    const req = createRequest({
      method: "POST",
      url: "api/auth/register",
      body: {
        email: "test@test.com",
        password: "testpassword",
        name: "Test Name",
      },
    });

    const res = createResponse();

    const mockUser = { ...req.body, save: jest.fn() };

    (User.create as jest.Mock).mockResolvedValue(mockUser);
    (hashPassword as jest.Mock).mockResolvedValue("hashedpassword");
    (generateToken as jest.Mock).mockReturnValue("123456"); // synchronous
    jest
      .spyOn(AuthEmail, "sendConfirmationEmail")
      .mockImplementation(() => Promise.resolve());

    await AuthController.createAccount(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toHaveProperty("message", "Account created successfully");
    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalledTimes(1);
    expect(mockUser.password).toBe("hashedpassword");
    expect(mockUser.token).toBe("123456");
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
      name: req.body.name,
      email: req.body.email,
      token: "123456",
    });
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
  });
});
