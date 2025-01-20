import request from "supertest";
import server, { connectDB } from "../../server";
import { AuthController } from "../../controllers/AuthControllers";

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
