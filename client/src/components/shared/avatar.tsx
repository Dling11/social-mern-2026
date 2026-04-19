import { cn } from '@/utils/cn'

export function Avatar({
  name,
  src,
  className,
}: {
  name: string
  src?: string | null
  className?: string
}) {
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-2xl object-cover', className)} />
  }

  return (
    <div className={cn('grid place-items-center rounded-2xl bg-secondary font-semibold text-primary', className)}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
