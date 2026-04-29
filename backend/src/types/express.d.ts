import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      role: Role;
      name: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
