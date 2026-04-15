import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // BASE
        "w-full h-12 rounded px-5 text-sm!",

        // FUNDO + BORDA
        "border border-gray-300",

        // TEXTO
        "text-black text-lg placeholder:text-gray-500",

        // INTERAÇÃO
        "outline-none transition-all duration-200",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",

        // ESTADOS
        "disabled:opacity-50 disabled:cursor-not-allowed",

        className
      )}
      {...props}
    />
  )
}

export { Input }
