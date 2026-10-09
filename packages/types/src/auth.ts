import { z } from "zod";

/**
 * Pakistani Mobile Number Regex:
 * Must start with +92 followed by 3 and 9 digits (total 13 chars)
 * e.g., +923001234567, +923219876543
 */
export const PAKISTANI_PHONE_REGEX = /^\+923[0-9]{9}$/;

export const CustomerRegisterSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  phone: z
    .string()
    .regex(
      PAKISTANI_PHONE_REGEX,
      "Phone number must be a valid Pakistani mobile number in the format +923XXXXXXXXX."
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password cannot exceed 100 characters."),
  displayName: z.string().trim().min(2).max(50).optional(),
});
export type CustomerRegisterInput = z.infer<typeof CustomerRegisterSchema>;

export const CustomerLoginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type CustomerLoginInput = z.infer<typeof CustomerLoginSchema>;

export const CustomerProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  phone: z.string(),
  displayName: z.string().nullable(),
  emailVerified: z.boolean(),
  affiliation: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;

export const AuthTokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  phone: z.string(),
  role: z.enum(["CUSTOMER"]),
  iat: z.number().optional(),
  exp: z.number().optional(),
});
export type AuthTokenPayload = z.infer<typeof AuthTokenPayloadSchema>;
