import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../config/env";

type JwtPayload = {
  id: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  name: string;
};

export const hashPassword = async (password: string) => bcrypt.hash(password, 12);

export const comparePassword = async (password: string, hashed: string) =>
  bcrypt.compare(password, hashed);

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as JwtPayload;
