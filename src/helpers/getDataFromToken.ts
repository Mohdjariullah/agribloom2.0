import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
  role: "admin" | "farmer";
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }
  return secret;
}

export const decodeTokenString = (token: string): DecodedToken => {
  if (!token) {
    throw new Error("No token provided");
  }
  try {
    return jwt.verify(token, getSecret()) as unknown as DecodedToken;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || "Token verification failed");
    }
    throw new Error("Token verification failed");
  }
};

export const getDataFromToken = (request: NextRequest): DecodedToken => {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    throw new Error("No token provided");
  }

  try {
    return jwt.verify(token, getSecret()) as unknown as DecodedToken;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Token verification failed");
    }
    throw new Error("Token verification failed");
  }
};
