import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthControllers";
import User from "../../../models/User";
import { checkPassword, hashPassword } from "../../../utils/auth";
import { generateToken } from "../../../utils/token";
import { AuthEmail } from "../../../email/AuthEmail";
import { generateJWT } from "../../../utils/jwt";

jest.mock("../../../models/User.ts"); // mock automatically
jest.mock("../../../utils/auth");
jest.mock("../../../utils/token");
jest.mock("../../../utils/jwt");

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

describe("AuthController.login", () => {
  it("should return 404 if user is not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const req = createRequest({
      method: "POST",
      url: "api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });

    const res = createResponse();
    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "User  not found" }); //message
    expect(data).toHaveProperty("error", "User  not found"); //message
  });

  it("should return 403 if the account has not been confirmed", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "password",
      confirmed: false,
    });

    const req = createRequest({
      method: "POST",
      url: "api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });

    const res = createResponse();
    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(403);
    expect(data).toEqual({ error: "Account not confirmed" });
  });

  it("should return 401 if the passowrd is incorrect", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "password",
      confirmed: true,
    };

    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });

    const res = createResponse();

    (checkPassword as jest.Mock).mockResolvedValue(false);

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(401);
    expect(data).toEqual({ error: "Incorrect password" });
    expect(checkPassword).toHaveBeenLastCalledWith(
      req.body.password,
      userMock.password
    );
    expect(checkPassword).toHaveBeenCalledTimes(1);
  });

  it("should return a JWT if authentication is successfull", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "hashpassword",
      confirmed: true,
    };

    const req = createRequest({
      method: "POST",
      url: "api/auth/login",
      body: {
        email: "test@test.com",
        password: "password",
      },
    });

    const res = createResponse();

    const fakejwt = "fake_jwt";

    (User.findOne as jest.Mock).mockResolvedValue(userMock);
    (checkPassword as jest.Mock).mockResolvedValue(true);
    (generateJWT as jest.Mock).mockReturnValue(fakejwt);

    await AuthController.login(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data.data.token).toEqual(fakejwt);
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenCalledWith(userMock.id);
  });
});
