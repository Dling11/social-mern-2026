import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register as registerAction } from '@/features/auth/auth-slice'
import { registerSchema, type RegisterFormValues } from '@/features/auth/auth-schemas'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { useAppSelector } from '@/hooks/use-app-selector'
import { AuthShell } from './auth-shell'

export function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const status = useAppSelector((state) => state.auth.status)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async ({ confirmPassword: _confirmPassword, middleName, ...values }) => {
    const result = await dispatch(
      registerAction({
        ...values,
        middleName: middleName?.trim() ? middleName.trim() : undefined,
      }),
    )
    if (registerAction.fulfilled.match(result)) {
      navigate('/feed')
    }
  })

  return (
    <AuthShell
      title="Create your account"
      description="Choose your profile name and username now so the social experience feels complete from the start."
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
    >
      <form className="space-y-5" onSubmit={(event) => void onSubmit(event)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="First name" {...register('firstName')} />
            {errors.firstName ? <p className="text-sm text-destructive">{errors.firstName.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Last name" {...register('lastName')} />
            {errors.lastName ? <p className="text-sm text-destructive">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input id="middleName" placeholder="Optional" {...register('middleName')} />
            {errors.middleName ? <p className="text-sm text-destructive">{errors.middleName.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="your.username" {...register('username')} />
            {errors.username ? <p className="text-sm text-destructive">{errors.username.message}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                className="pr-11"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                onClick={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            ) : null}
          </div>
        </div>

        <Button className="w-full" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}
