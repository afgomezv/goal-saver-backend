import request from "supertest";
import server, { connectDB } from "../../server";
import { AuthController } from "../../controllers/AuthControllers";
import User from "../../models/User";
import * as authUtils from "../../utils/auth";
import * as jwtUtils from "../../utils/jwt";

describe("Aunthentication - Create Account", () => {
  it("should display validation errors when form is empty", async () => {
    const response = await request(server).post("/api/auth/register").send({});

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(3);

    expect(response.status).not.toBe(201);
    expect(response.body.errors).not.toHaveLength(2);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  it("should return 400 status code when the email is invalid", async () => {
    const response = await request(server).post("/api/auth/register").send({
      name: "Fulanito Perez",
      email: "not-valid-email",
      password: "12345678",
    });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);

    expect(response.body.errors[0].msg).toBe("Email is not valid");

    expect(response.status).not.toBe(201);
    expect(response.body.errors).not.toHaveLength(2);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  it("should return 400 status code when the password is less than 8 characters", async () => {
    const response = await request(server).post("/api/auth/register").send({
      name: "Fulanito Perez",
      email: "fulanito@email.com",
      password: "short",
    });

    const createAccountMock = jest.spyOn(AuthController, "createAccount");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);

    expect(response.body.errors[0].msg).toBe(
      "Password must be at least 8 characters"
    );

    expect(response.status).not.toBe(201);
    expect(response.body.errors).not.toHaveLength(2);
    expect(createAccountMock).not.toHaveBeenCalled();
  });

  it("should return 201 status code when create user successfully", async () => {
    const userData = {
      name: "Fulanito Test",
      email: "test@email.com",
      password: "12345678",
    };
    const response = await request(server)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(201);

    expect(response.status).not.toBe(400);
    expect(response.body).not.toHaveProperty("errors");
  });

  it("should return 409 conflict when a user is already registered", async () => {
    const userData = {
      name: "Fulanito Test",
      email: "test@email.com",
      password: "12345678",
    };
    const response = await request(server)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Email already in use");
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(201);
    expect(response.body).not.toHaveProperty("errors");
  });
});

describe("Authentication - Account Confirmation with Token", () => {
  it("should return 400 status code when the token is empty or token is not valid", async () => {
    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({ token: "not_valid" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Token is  not valid");
  });

  it("should return 401 status code when invalid Token", async () => {
    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({ token: "123456" });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Invalid token");
    expect(response.status).not.toBe(200);
  });

  it("should confirm account with a valid Token", async () => {
    const token = globalThis.goalSaverConfirmationToken;

    const response = await request(server)
      .post("/api/auth/confirm-account")
      .send({ token });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Account confirmation successfully");
    expect(response.status).not.toBe(401);
  });
});

describe("Authentication - Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 status code when the email or password is empty", async () => {
    const response = await request(server).post("/api/auth/login").send({});

    const loginMock = jest.spyOn(AuthController, "login");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(2);

    expect(response.status).not.toBe(200);
    expect(response.body.errors).not.toHaveLength(1);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should return 400 status code when the email is invalid", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "not-valid-email",
      password: "12345678",
    });

    const loginMock = jest.spyOn(AuthController, "login");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("Email is not valid");

    expect(response.status).not.toBe(200);
    expect(response.body.errors).not.toHaveLength(2);
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("should return 404 status code when if the user is not found", async () => {
    const response = await request(server).post("/api/auth/login").send({
      email: "user_not_found@test.com",
      password: "12345678",
    });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("User  not found");

    expect(response.status).not.toBe(200);
  });

  it("should return 403 status code when if the account is not found + mock", async () => {
    (jest.spyOn(User, "findOne") as jest.Mock).mockResolvedValue({
      id: 1,
      confirmed: false,
      email: "user_not_confirmed@test.com",
      password: "hashedPassword",
    });

    const response = await request(server).post("/api/auth/login").send({
      email: "user_not_confirmed@test.com",
      password: "password",
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Account not confirmed");

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
  });

  it("should return 403 status code when if the account is not found + endpoint", async () => {
    const userData = {
      name: "Pepito Test",
      email: "user_not_confirmed@test.com",
      password: "password",
    };
    await request(server).post("/api/auth/register").send(userData);

    const response = await request(server).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Account not confirmed");

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
  });

  it("should return 401 status code when if the password is incorrect", async () => {
    const findOne = (
      jest.spyOn(User, "findOne") as jest.Mock
    ).mockResolvedValue({
      id: 1,
      confirmed: true,
      password: "hashedPassword",
    });

    const checkPassword = jest
      .spyOn(authUtils, "checkPassword")
      .mockResolvedValue(false);

    const response = await request(server).post("/api/auth/login").send({
      email: "test@test.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Incorrect password");

    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(404);
    expect(response.status).not.toBe(403);

    expect(findOne).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledTimes(1);
  });

  it("should return a jwt", async () => {
    const findOne = (
      jest.spyOn(User, "findOne") as jest.Mock
    ).mockResolvedValue({
      id: 50,
      confirmed: true,
      password: "hashedPassword",
    });

    const checkPassword = jest
      .spyOn(authUtils, "checkPassword")
      .mockResolvedValue(true);

    const generateJWT = jest
      .spyOn(jwtUtils, "generateJWT")
      .mockReturnValue("jwt_token");

    const response = await request(server).post("/api/auth/login").send({
      email: "test@test.com",
      password: "correctpassword",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toEqual("jwt_token");
    expect(response.body.message).toEqual("Login successfully");

    expect(findOne).toHaveBeenCalled();
    expect(findOne).toHaveBeenCalledTimes(1);

    expect(checkPassword).toHaveBeenCalled();
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledWith(
      "correctpassword",
      "hashedPassword"
    );

    expect(generateJWT).toHaveBeenCalled();
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenCalledWith(50);
  });
});

let jwt: string;
async function authenticateUser() {
  const response = await request(server).post("/api/auth/login").send({
    email: "test@email.com",
    password: "12345678",
  });
  jwt = response.body.data.token;
  expect(response.status).toBe(200);
}

describe("GET /api/budgets", () => {
  beforeAll(() => {
    jest.restoreAllMocks(); // Restaura las funciones de lsos jest.spy a su implementacion original
  });

  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated access to budgets without a jwt", async () => {
    const response = await request(server).get("/api/budgets");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Not authenticated");
  });

  it("should allow authenticated access to budgets with a valid jwt", async () => {
    const response = await request(server)
      .get("/api/budgets")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body.budgets).toHaveLength(0);

    expect(response.status).not.toBe(401);
    expect(response.body.error).not.toBe("Not authenticated");
  });

  it("should allow authenticated access to budgets without a valid jwt", async () => {
    const response = await request(server)
      .get("/api/budgets")
      .auth("not_valid", { type: "bearer" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe("Token invalid");
  });
});

describe("POST /api/budgets", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated post request to budgets without a jwt", async () => {
    const response = await request(server).post("/api/budgets");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Not authenticated");
  });

  it("should return error validation when the is submitted with invalid data", async () => {
    const response = await request(server)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors).toHaveLength(4);
  });

  it("should return 201 when create budget successfully", async () => {
    const response = await request(server)
      .post("/api/budgets")
      .auth(jwt, { type: "bearer" })
      .send({
        name: "Test Budget",
        amount: 1000,
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("budget created successfully");
  });
});

describe("GET /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated get request to budget id without a jwt", async () => {
    const response = await request(server).get("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Not authenticated");
  });

  it("should return 400 bad request when id is not valid", async () => {
    const response = await request(server)
      .get("/api/budgets/not_valid")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("ID must be a number");
    expect(response.status).not.toBe(401);
    expect(response.body.error).not.toBe("Not authenticated");
  });

  it("should return 401 not found when a budget doesnt exists", async () => {
    let id = 1000;
    const response = await request(server)
      .get(`/api/budgets/${id}`)
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(404);
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(`Budget not found with ID: ${id}`);
    expect(response.body.error).not.toBe("Not authenticated");
  });

  it("should return a single budget by id", async () => {
    const response = await request(server)
      .get(`/api/budgets/1`)
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(401);
    expect(response.body).not.toHaveProperty("error");
    expect(response.body.error).not.toBe("Not authenticated");
  });
});

describe("PUT /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated get request to budget id without a jwt", async () => {
    const response = await request(server).put("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Not authenticated");
  });

  it("should return 400 bad request when id is not valid", async () => {
    const response = await request(server)
      .put("/api/budgets/not_valid")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("ID must be a number");
    expect(response.status).not.toBe(401);
    expect(response.body.error).not.toBe("Not authenticated");
  });

  it("should return 401 not found when a budget doesnt exists", async () => {
    let id = 1000;
    const response = await request(server)
      .put(`/api/budgets/${id}`)
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(404);
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(`Budget not found with ID: ${id}`);
    expect(response.body.error).not.toBe("Not authenticated");
  });

  it("should return 400 when has validation erros if the form is empty", async () => {
    const response = await request(server)
      .put(`/api/budgets/1`)
      .auth(jwt, { type: "bearer" })
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(4);
  });

  it("should return 200 when udpate budget", async () => {
    const response = await request(server)
      .put("/api/budgets/1")
      .auth(jwt, { type: "bearer" })
      .send({
        name: "Updated Budget",
        amount: 1500,
      });

    expect(response.status).toBe(200);
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(401);
    expect(response.body.message).toBe("budget updated successfully");
    expect(response.body).not.toHaveProperty("error");
    expect(response.body.error).not.toBe("Not authenticated");
  });
});

describe("DELETE /api/budgets/:id", () => {
  beforeAll(async () => {
    await authenticateUser();
  });

  it("should reject unauthenticated get request to budget id without a jwt", async () => {
    const response = await request(server).delete("/api/budgets/1");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Not authenticated");
  });

  it("should return 400 bad request when id is not valid", async () => {
    const response = await request(server)
      .delete("/api/budgets/not_valid")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors).toBeTruthy();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].msg).toBe("ID must be a number");
    expect(response.status).not.toBe(401);
    expect(response.body.error).not.toBe("Not authenticated");
  });

  it("should return 401 not found when a budget doesnt exists", async () => {
    let id = 1000;
    const response = await request(server)
      .delete(`/api/budgets/${id}`)
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(404);
    expect(response.status).not.toBe(400);
    expect(response.status).not.toBe(401);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toBe(`Budget not found with ID: ${id}`);
    expect(response.body.error).not.toBe("Not authenticated");
  });

  it("should delete a budget and return a success message", async () => {
    const response = await request(server)
      .delete("/api/budgets/1")
      .auth(jwt, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("budget deleted successfully");
  });
});
