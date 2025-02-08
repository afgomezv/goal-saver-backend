import type { Request, Response } from "express";
import { AuthEmail } from "../email/AuthEmail";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";
import { generateToken } from "../utils/token";

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
      const user = await User.create(req.body);
      user.password = await hashPassword(password);
      const token = generateToken();

      if (process.env.NODE_ENV !== "production") {
        globalThis.goalSaverConfirmationToken = token;
      }

      user.token = token;
      await user.save();

      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        email: user.email,
        token: user.token,
      });

      res.status(201).json({
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

    try {
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
        message: "Account confirmation successfully",
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

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (!user.confirmed) {
        res.status(403).json({ error: "Account not confirmed" });
        return;
      }

      const ispasswordCorrect = await checkPassword(password, user.password);

      if (!ispasswordCorrect) {
        res.status(401).json({ error: "Incorrect password" });
        return;
      }

      const token = generateJWT(user.id);

      res.status(200).json({
        ok: ispasswordCorrect,
        message: "Login successfully",
        data: {
          name: user.name,
          email: user.email,
          token,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      user.token = generateToken();
      await user.save();

      await AuthEmail.sendPasswordResetToken({
        name: user.name,
        email: user.email,
        token: user.token,
      });

      res.status(200).json({
        message: "Password reset email sent successfully",
        data: {
          email: user.email,
          token: user.token,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    const { token } = req.body;
    try {
      const tokenExists = await User.findOne({
        where: {
          token,
        },
      });

      if (!tokenExists) {
        res.status(404).json({ error: "Invalid token" });
        return;
      }

      res.status(200).json({
        message: "Token is valid",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    const { password } = req.body;
    const { token } = req.params;
    try {
      const user = await User.findOne({
        where: {
          token,
        },
      });

      if (!user) {
        res.status(404).json({ error: "Invalid token" });
        return;
      }

      user.password = await hashPassword(password);
      user.token = null;
      await user.save();

      res.status(200).json({
        message: "Password reset successful",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;
    const { id } = req.user;

    const user = await User.findByPk(id);

    const ispasswordCorrect = await checkPassword(
      current_password,
      user.password
    );

    if (!ispasswordCorrect) {
      res.status(401).json({ error: "Incorrect current password" });
      return;
    }

    user.password = await hashPassword(password);
    await user.save();

    res.status(200).json({
      message: "Current password updated successfully",
    });
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const { id } = req.user;

    const user = await User.findByPk(id);

    const ispasswordCorrect = await checkPassword(password, user.password);

    if (!ispasswordCorrect) {
      res.status(401).json({ error: "Incorrect current password" });
      return;
    }

    res.status(200).json({
      message: "Password is correct",
    });
  };

  static updateUser = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const userExists = await User.findOne({
        where: {
          email,
        },
      });

      if (userExists && userExists.id !== req.user.id) {
        res.status(409).json({ error: "Email already in use" });
        return;
      }

      await req.user.update(req.body);
      res.status(200).json({
        message: "User updated successfully",
        data: req.user,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
