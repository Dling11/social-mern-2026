import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'

interface AuthShellProps extends PropsWithChildren {
  title: string
  description: string
  footerText: string
  footerLinkLabel: string
  footerLinkTo: string
}

export function AuthShell({
  title,
  description,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  children,
}: AuthShellProps) {
  return (
    <Card className="mx-auto w-full max-w-md p-8">
      <div className="mb-8 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Authentication</p>
        <h2 className="text-3xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      {children}

      <p className="mt-6 text-sm text-muted-foreground">
        {footerText}{' '}
        <Link to={footerLinkTo} className="font-semibold text-primary transition-opacity hover:opacity-80">
          {footerLinkLabel}
        </Link>
      </p>
    </Card>
  )
}
