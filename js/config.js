// Main config file. Mostly read the configuration from .env files

import Config from 'react-native-config'

module.exports = {
  apiUrlPrefix: Config.API_URL_PREFIX,
  mixpanelToken: Config.MIXPANEL_TOKEN
}
