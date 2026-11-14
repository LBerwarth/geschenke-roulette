import type { ButtonHTMLAttributes } from 'react'

const variants = {
  gold: 'bg-gold text-ink',
  blue: 'bg-blue text-white',
  white: 'bg-white text-eyebrow',
  outline: 'border-2 border-line text-text',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }

export function Button({ variant = 'outline', className = '', ...props }: Props) {
  return (
    <button
      type="button"
      className={`min-h-15 cursor-pointer rounded-2xl px-6 text-[19px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
