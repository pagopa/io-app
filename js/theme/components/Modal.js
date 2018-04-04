// @flow

import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    'NativeBase.ViewNB': {
      '.header': {
        height: variables.modalHeaderHeight,
        alignSelf: 'flex-end'
      }
    },

    'NativeBase.Content': {
      padding: 0
    },

    '.fullscreen': {
      margin: variables.modalMargin
    },

    padding: variables.modalPadding,
    paddingBottom: 0,
    backgroundColor: variables.contentBackground
  }

  return theme
}
