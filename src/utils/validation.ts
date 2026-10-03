import { z } from "zod";
import { BLOOD_GROUPS, DISTRICTS, URGENCY_LEVELS } from "../config/constants";

// the API accepts 07XXXXXXXX and +947XXXXXXXX; the app keeps one format so login by phone always matches
const phone = z.string().trim().regex(/^07\d{8}$/, "Enter a valid mobile number (07XXXXXXXX)");

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or mobile number"),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short"),
    phone,
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Select your blood group" }) }),
    district: z.enum(DISTRICTS, { errorMap: () => ({ message: "Select your district" }) }),
    area: z.string().trim().max(60, "Area is too long"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;

export const requestSchema = z.object({
  patientName: z.string().trim().max(80, "Name is too long"),
  bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Select the blood group needed" }) }),
  units: z.string().regex(/^(?:[1-9]|10)$/, "Select 1 to 10 units"),
  hospital: z.string().trim().min(2, "Enter the hospital name").max(120, "Hospital name is too long"),
  district: z.enum(DISTRICTS, { errorMap: () => ({ message: "Select the district" }) }),
  urgency: z.enum(URGENCY_LEVELS),
  neededBy: z.string().min(1, "Select the date blood is needed"),
  contactPhone: phone,
  note: z.string().trim().max(500, "Note is too long (max 500 characters)"),
});

export type RequestForm = z.infer<typeof requestSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  bloodGroup: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: "Select your blood group" }) }),
  district: z.enum(DISTRICTS, { errorMap: () => ({ message: "Select your district" }) }),
  area: z.string().trim().max(60, "Area is too long"),
  lastDonationDate: z.string(), // "" = not set
  showPhone: z.boolean(),
});

export type ProfileForm = z.infer<typeof profileSchema>;
