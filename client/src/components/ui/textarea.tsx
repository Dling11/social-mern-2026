import * as React from 'react'
import { cn } from '@/utils/cn'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-24 w-full rounded-[9px] border border-input bg-background/80 px-4 py-3 text-sm text-foreground shadow-sm transition-[border,box-shadow,background-color] outline-none placeholder:text-muted-foreground hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
        className,
      )}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'
