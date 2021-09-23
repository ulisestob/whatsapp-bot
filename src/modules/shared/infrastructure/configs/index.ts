import { envalidator } from './envalidator'
import 'dotenv/config'

const env = envalidator()

const configs = {
    auth: JSON.parse(env.AUTH_INFO)
}

export default configs
