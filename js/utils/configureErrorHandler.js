/**
 * Implements a custom generic error handler that keeps track of JavaScript exceptions
 */

import Mixpanel from 'react-native-mixpanel'
import { initSourceMaps, getStackTrace } from '../react-native-source-maps'
import DeviceInfo from 'react-native-device-info'

import { Alert } from 'react-native'

import I18n from '../i18n'

const isDev = __DEV__
const version = DeviceInfo.getReadableVersion()

// Custom error handler for unhandled js exceptions
const customErrorHandler = async (error, isFatal) => {
  if (isFatal) {
    error.stack = await getStackTrace(error)
    // Send a remote event that contains the error stack trace
    Mixpanel.trackWithProperties('APPLICATION_ERROR', {
      ERROR: JSON.stringify(error),
      ERROR_STACK_TRACE: JSON.stringify(error.stack),
      APP_VERSION: version
    })

    // Inform the user about the unfortunate event
    Alert.alert(
      I18n.t('global.jserror.title'),
      I18n.t('global.jserror.message')
    )
  }
}

const configureErrorHandler = () => {
  if (!isDev) {
    initSourceMaps({ sourceMapBundle: 'main.jsbundle.map' })
    // Overrides the default error handler in BUNDLED MODE
    global.ErrorUtils.setGlobalHandler(customErrorHandler)
  }
}

export default configureErrorHandler
