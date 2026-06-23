import { z } from 'zod'

export const registerSchema = z.object({
    nombre: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede superar los 100 caracteres')
        .trim(),
    email: z
        .string()
        .email('El email no es válido')
        .min(6, 'El email debe tener al menos 6 caracteres')
        .max(150, 'El email no puede superar los 150 caracteres')
        .trim(),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(128, 'La contraseña no puede superar los 128 caracteres'),
})

export const updatePerfilSchema = z.object({
    nombre: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede superar los 100 caracteres')
        .trim(),
    email: z
        .string()
        .email('El email no es válido')
        .max(150, 'El email no puede superar los 150 caracteres')
        .trim(),
})

export const updatePasswordSchema = z.object({
    passwordActual: z.string().min(6).max(128),
    passwordNueva: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(128, 'La contraseña no puede superar los 128 caracteres'),
})

export const loginSchema = z.object({
    email: z
        .string()
        .email('El email no es válido')
        .max(150, 'El email no puede superar los 150 caracteres')
        .trim(),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(128, 'La contraseña no puede superar los 128 caracteres'),
})