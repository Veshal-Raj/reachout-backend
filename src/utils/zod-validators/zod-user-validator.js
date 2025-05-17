import z from "zod";


export const createUserSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email(),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters long" })
});

export const loginUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export const emailSchema = z.string().email()