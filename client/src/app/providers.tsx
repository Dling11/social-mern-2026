import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
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
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  )
}
