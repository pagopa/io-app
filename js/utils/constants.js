// @flow

import DeviceInfo from 'react-native-device-info'

module.exports = {
  VERSION: DeviceInfo.getReadableVersion(),
  // A key to identify the Set of the listeners of the navigtion middleware.
  NAVIGATION_MIDDLEWARE_LISTENERS_KEY: 'root'
}
