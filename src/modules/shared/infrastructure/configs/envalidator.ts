import { cleanEnv, str } from 'envalid'

export const envalidator = () => {
  const variables = {
    AUTH_INFO: str(),
  }
  
  return cleanEnv(process.env, variables)
}
