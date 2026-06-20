import { env, IS_DEV, IS_TEST, IS_PROD } from '@savant-code/common/env'

export { IS_DEV, IS_TEST, IS_PROD }

export const SAVANT_CODE_BINARY = 'SavantCode'

export const WEBSITE_URL = env.NEXT_PUBLIC_SAVANT_CODE_APP_URL
