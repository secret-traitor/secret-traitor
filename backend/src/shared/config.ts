// ==== NODE CONFIGURATION ====
export const DEBUG: boolean = Boolean(process.env.DEBUG)
export const NODE_ENV: 'development' | 'production' =
    process.env.NODE_ENV === 'development' ? 'development' : 'production'
export const PORT = Number(process.env.PORT ?? 3000)
type LogLevel = 'error' | 'warn' | 'info' | 'debug'
export const LOG_LEVEL: LogLevel =
    (process.env.LOG_LEVEL as LogLevel) || 'debug'

// ==== APP CONFIGURATION ====
export const GAMES_TABLE_NAME: string = process.env.GAMES_TABLE_NAME || 'Games'

// ==== AWS LAMBDA GRAPHQL CONFIGURATION ====
// ---- connections ----
export const CONNECTIONS_TABLE_NAME: string =
    process.env.CONNECTIONS_TABLE_NAME || 'Connections'

export const CONNECTION_TTL: number = Number(process.env.CONNECTION_TTL ?? 7200)

// ---- subscriptions ----
export const SUBSCRIPTIONS_OPERATIONS_TABLE_NAME: string =
    process.env.SUBSCRIPTIONS_OPERATIONS_TABLE_NAME || 'SubscriptionOperations'

export const SUBSCRIPTIONS_TABLE_NAME: string =
    process.env.SUBSCRIPTIONS_TABLE_NAME || 'Subscriptions'

export const SUBSCRIPTION_TTL: number = Number(
    process.env.SUBSCRIPTION_TTL ?? 7200
)
