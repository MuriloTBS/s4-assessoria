import { z } from 'zod'

export const loginSchema = z.object({
  email:    z.string().email('Email inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.').max(128, 'Senha muito longa.'),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Nome muito curto.').max(100, 'Nome muito longo.').trim(),
})

export const clientSchema = z.object({
  name:    z.string().min(1, 'Nome é obrigatório.').max(255),
  email:   z.string().email('Email inválido.').optional().or(z.literal('')),
  phone:   z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  notes:   z.string().optional(),
})

export const projectSchema = z.object({
  name:         z.string().min(1, 'Nome é obrigatório.').max(255),
  client_id:    z.number({ message: 'Cliente é obrigatório.' }),
  status:       z.enum(['Em andamento', 'Concluído', 'Pausado', 'Cancelado']),
  value:        z.number().min(0).optional(),
  deadline:     z.string().optional(),
  description:  z.string().optional(),
  useful_links: z.string().url('URL inválida.').optional().or(z.literal('')),
  notes:        z.string().optional(),
})

export const parametersSchema = z.object({
  hourly_rate:         z.number().min(0, 'Deve ser maior ou igual a 0.'),
  default_margin:      z.number().min(0).max(100, 'Deve ser entre 0 e 100.'),
  default_complexity:  z.enum(['Simples', 'Médio', 'Complexo', 'Muito Complexo']),
})

export type LoginInput      = z.infer<typeof loginSchema>
export type RegisterInput   = z.infer<typeof registerSchema>
export type ClientInput     = z.infer<typeof clientSchema>
export type ProjectInput    = z.infer<typeof projectSchema>
export type ParametersInput = z.infer<typeof parametersSchema>
