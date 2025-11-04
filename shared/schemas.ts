import z from "zod"

//give error messages later
export const loginSchema = z.object({
    email: z.email().nonempty(),
    password:z.string().nonempty()
})

export const signupSchema = z.object({
    username: z.string().nonempty(),
    email: loginSchema.shape.email,
    password: loginSchema.shape.password
})