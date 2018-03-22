// @flow

import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    '.block': {
      '.iconVeryLeft': {
        'NativeBase.Icon': {
          flex: 0,
          borderRightWidth: 1,
          borderColor: '#FFFFFF',
          margin: 0,
          padding: 11,
          paddingLeft: 15,
          paddingRight: 15
        },

        'NativeBase.Text': {
          flex: 1,
          textAlign: 'center'
        },

        padding: 0,
        display: 'flex',
        justifyContent: 'flex-start'
      }
    },

    '.small': {
      height: variables.btnSmallHeight
    },

    'NativeBase.Text': {
      fontWeight: variables.btnTextFontWeight
    },

    borderRadius: variables.borderRadiusBase,
    height: variables.btnHeight,
    elevation: 0,
    shadowColor: null,
    shadowOffset: null,
    shadowRadius: null,
    shadowOpacity: null
  }

  return theme
}
