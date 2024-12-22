import type { Request, Response } from "express";
import User from "../models/User";
import { hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../email/AuthEmail";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userExists = await User.findOne({
      where: {
        email,
      },
    });

    if (userExists) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    try {
      const user = new User(req.body);
      user.password = await hashPassword(password);
      user.token = generateToken();
      await user.save();

      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token,
      });

      res.status(200).json({
        message: "Account created successfully",
        data: {
          name: user.name,
          email: user.email,
          confirmed: user.confirmed,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    const { token } = req.body;

    const user = await User.findOne({
      where: {
        token,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    user.confirmed = true;
    user.token = null;
    await user.save();

    res.status(200).json({
      message: "Account confirmation successful",
      data: {
        name: user.name,
        email: user.email,
        confirmed: user.confirmed,
      },
    });
  };
}
