import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renderiza o texto filho', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByText('Clique aqui')).toBeInTheDocument()
  })

  it('variant primary aplica classe bg-blue-500', () => {
    render(<Button variant="primary">OK</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500')
  })

  it('variant danger aplica classe text-red-400', () => {
    render(<Button variant="danger">Excluir</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-red-400')
  })

  it('disabled aplica opacity-50 e desativa o botão', () => {
    render(<Button disabled>Aguarde</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass('disabled:opacity-50')
  })
})
