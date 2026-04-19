import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
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
      <AppBootstrap />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!rounded-2xl !border !border-border !bg-card !text-card-foreground',
        }}
      />
    </Provider>
  )
}
