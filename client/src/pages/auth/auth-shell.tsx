import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
    <Card className="mx-auto w-full max-w-xl border-white/60 bg-card/90 p-0 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl">
      <CardHeader className="border-b border-border/60 px-8 py-7">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">Authentication</p>
        <CardTitle className="pt-2 text-3xl">{title}</CardTitle>
        <CardDescription className="max-w-lg text-sm leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-8 py-7">
        {children}
        <p className="mt-6 text-sm text-muted-foreground">
          {footerText}{' '}
          <Link to={footerLinkTo} className="font-semibold text-primary transition-opacity hover:opacity-80">
            {footerLinkLabel}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
