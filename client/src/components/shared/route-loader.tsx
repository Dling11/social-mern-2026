import { Card } from '@/components/ui/card'

export function RouteLoader() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md text-center">
        <p className="text-lg font-semibold text-foreground">Loading page</p>
        <p className="mt-2 text-sm text-muted-foreground">Preparing the next part of your workspace.</p>
      </Card>
    </div>
  )
}
