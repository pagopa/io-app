import { Theme } from '../types'
import variables from '../variables'

import * as ReactNative from 'react-native'

declare module 'native-base' {
  namespace NativeBase {
    interface View extends ReactNative.ViewProperties {
      spacer?: boolean
      large?: boolean
      extralarge?: boolean
      modal?: boolean
      footer?: boolean
      header?: boolean
    }
  }
}

export default (): Theme => {
  const theme = {
    '.spacer': {
      '.large': {
        height: variables.spacerLargeHeight
      },

      '.extralarge': {
        height: variables.spacerExtralargeHeight
      },

      height: variables.spacerHeight
    },

    '.modal': {
      flex: 1,
      backgroundColor: variables.contentBackground
    },

    '.footer': {
      backgroundColor: variables.footerBackground,
      paddingBottom: variables.footerPaddingBottom,
      paddingLeft: variables.footerPaddingLeft,
      paddingRight: variables.footerPaddingRight,
      paddingTop: variables.footerPaddingTop,
      // iOS shadow
      shadowColor: variables.footerShadowColor,
      shadowOffset: {
        width: variables.footerShadowOffsetWidth,
        height: variables.footerShadowOffsetHeight
      },
      shadowOpacity: variables.footerShadowOpacity,
      shadowRadius: variables.footerShadowRadius,
      // Android shadow
      elevation: variables.footerElevation
    }
  }

  return theme
}
