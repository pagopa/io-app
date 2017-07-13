/**
 * Implements a custom generic error handler that keeps track of JavaScript exceptions
 */

/* eslint no-console: ["error", { allow: ["log"] }] */

import Mixpanel from 'react-native-mixpanel'
import StackTrace from 'stacktrace-js'

import { Alert } from 'react-native'

const isDev = __DEV__

const customErrorHandler = (error, isFatal) => {
  if (isFatal) {
    // Send a remote event that contains the error stack trace

    // https://gist.github.com/tianjianchn/af8bdbdf4c19135f505a59d0d637745b
    StackTrace.fromError(error, { offline: true })
      .then((stack) => {
        return stack.map(row => {
          let { source, lineNumber } = row
          if (!lineNumber) {
            lineNumber = parseInt(source.split(':').slice(-2, -1)) || 0
          }
          return { fileName: error.message, lineNumber, functionName: source }
        })
      })
      .then((stack) => {
        Mixpanel.trackWithProperties('APPLICATION_ERROR', {
          'stack': stack
        })
      })

    // Inform the user about the unfortunate event
    Alert.alert(
      'Unexpected error occurred',
      `
      We have reported this to our team! Please close the app and start again!
      `
    )
  } else {
    // Preserve logging to the device console (i.e. ADB)
    console.log(error)
  }
}


const configureErrorHandler = () => {
  if (!isDev) {
    // Overrides the default error handler in BUNDLED MODE
    global.ErrorUtils.setGlobalHandler(customErrorHandler)
  }
}

export default configureErrorHandler
