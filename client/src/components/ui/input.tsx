import * as React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-input bg-background/80 px-4 py-2 text-sm text-foreground shadow-sm transition-[border,box-shadow,background-color] outline-none placeholder:text-muted-foreground hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'
