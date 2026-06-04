import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, parametersSchema } from './schemas'

describe('loginSchema', () => {
  it('aceita credenciais válidas', () => {
    expect(() => loginSchema.parse({ email: 'a@b.com', password: 'abc123' })).not.toThrow()
  })
  it('rejeita email inválido', () => {
    expect(() => loginSchema.parse({ email: 'nao-email', password: 'abc123' })).toThrow()
  })
  it('rejeita senha curta', () => {
    expect(() => loginSchema.parse({ email: 'a@b.com', password: '123' })).toThrow()
  })
})

describe('registerSchema', () => {
  it('aceita dados completos válidos', () => {
    expect(() => registerSchema.parse({ name: 'João', email: 'a@b.com', password: 'abc123' })).not.toThrow()
  })
  it('rejeita nome muito curto', () => {
    expect(() => registerSchema.parse({ name: 'J', email: 'a@b.com', password: 'abc123' })).toThrow()
  })
})

describe('parametersSchema', () => {
  it('aceita valores válidos', () => {
    expect(() => parametersSchema.parse({ hourly_rate: 100, default_margin: 20, default_complexity: 'Médio' })).not.toThrow()
  })
  it('rejeita margem acima de 100', () => {
    expect(() => parametersSchema.parse({ hourly_rate: 100, default_margin: 150, default_complexity: 'Médio' })).toThrow()
  })
  it('rejeita complexidade inválida', () => {
    expect(() => parametersSchema.parse({ hourly_rate: 100, default_margin: 20, default_complexity: 'Absurdo' })).toThrow()
  })
})
