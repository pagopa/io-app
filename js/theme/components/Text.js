// @flow

import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    '.link': {
      color: variables.textLinkColor,
      fontWeight: '600'
    },

    lineHeight: variables.lineHeight
  }

  return theme
}
