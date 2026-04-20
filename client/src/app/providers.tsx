import type { ComponentType, PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/app/query-client'
import { store } from '@/app/store'
import { bootstrapSession } from '@/features/auth/auth-slice'
import { getStoredTheme } from '@/features/theme/theme-storage'
import { applyTheme } from '@/features/theme/theme-utils'

function AppBootstrap() {
  useEffect(() => {
    applyTheme(getStoredTheme())
    store.dispatch(bootstrapSession())
  }, [])

  return null
}

function QueryDevtoolsToggle() {
  const [Devtools, setDevtools] = useState<ComponentType<{ initialIsOpen?: boolean }> | null>(null)

  useEffect(() => {
    if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS !== 'true') {
      return
    }

    void import('@tanstack/react-query-devtools').then((module) => {
      setDevtools(() => module.ReactQueryDevtools)
    })
  }, [])

  if (!Devtools) {
    return null
  }

  return <Devtools initialIsOpen={false} />
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppBootstrap />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!rounded-lg !border !border-border !bg-card !text-card-foreground',
          }}
        />
        <QueryDevtoolsToggle />
      </QueryClientProvider>
    </Provider>
  )
}
