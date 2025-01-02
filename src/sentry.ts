import { BrowserClient, defaultStackParser, getDefaultIntegrations, makeFetchTransport, Scope } from '@sentry/browser'

import { ENVIRONMENT_KEYS } from '@/utils/constants'

const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
  return !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(defaultIntegration.name)
})

const client = new BrowserClient({
  dsn: ENVIRONMENT_KEYS.VITE_SENTRY_URL,
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: integrations
})

const scope = new Scope()
scope.setClient(client)

client.init()
