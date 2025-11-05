import z from "zod"

//give error messages later
export const loginSchema = z.object({
    email: z.email().nonempty(),
    password:z.string().nonempty()
})

export const signupSchema = loginSchema.extend({username: z.string().nonempty()})