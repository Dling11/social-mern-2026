import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/features/auth/auth-slice'
import { loginSchema, type LoginFormValues } from '@/features/auth/auth-schemas'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { AuthShell } from './auth-shell'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector((state) => state.auth.status)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      navigate(result.payload.role === 'admin' ? '/admin' : '/feed')
    }
  })

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in with your email or username to access your social feed, profile, and conversations."
      footerText="New here?"
      footerLinkLabel="Create an account"
      footerLinkTo="/register"
    >
      <form className="space-y-5" onSubmit={(event) => void onSubmit(event)}>
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or Username</Label>
          <Input id="identifier" placeholder="you@example.com or username" {...register('identifier')} />
          {errors.identifier ? <p className="text-sm text-destructive">{errors.identifier.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="pr-11"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
        </div>

        <Button className="w-full" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}
