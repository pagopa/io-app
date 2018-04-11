// @flow

import { type Theme } from '../types'
import variables from '../variables'

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
      paddingTop: variables.footerPaddingTop,
      paddingLeft: variables.footerPaddingLeft,
      paddingBottom: variables.footerPaddingBottom,
      paddingRight: variables.footerPaddingRight,
      backgroundColor: variables.footerBackground,
      borderTopWidth: variables.footerShadowWidth,
      borderColor: variables.footerShadowColor
    }
  }

  return theme
}
