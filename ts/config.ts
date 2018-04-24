// Main config file. Mostly read the configuration from .env files

import Config from 'react-native-config'

export default {
  environment: Config.ENVIRONMENT,
  apiUrlPrefix: Config.API_URL_PREFIX,
  mixpanelToken: Config.MIXPANEL_TOKEN,
  enableTestIdp: Config.ENABLE_TEST_IDP === 'YES'
}
