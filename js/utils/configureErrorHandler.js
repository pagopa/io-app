/**
 * Implements a custom generic error handler that keeps track of JavaScript exceptions
 */

/* eslint no-console: [{ allow: ["error"] }] */

import Mixpanel from 'react-native-mixpanel'
import { initSourceMaps, getStackTrace } from '../react-native-source-maps'
import DeviceInfo from 'react-native-device-info'

import { Alert } from 'react-native'

const isDev = __DEV__
const version = DeviceInfo.getReadableVersion()

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
      'Unexpected error occurred',
      'We have reported this to our team! Please close the app and start again!'
    )
  } else {
    // Preserve logging to the device's console (i.e. ADB)
    console.error(error)
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
