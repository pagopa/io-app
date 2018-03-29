// @flow

import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    'NativeBase.Left': {
      flex: 0.1
    },
    'NativeBase.Body': {
      'NativeBase.Text': {
        color: variables.toolbarTextColor,
        backgroundColor: 'transparent'
      }
    },

    elevation: 0,
    shadowColor: null,
    shadowOffset: null,
    shadowRadius: null,
    shadowOpacity: null
  }

  return theme
}
