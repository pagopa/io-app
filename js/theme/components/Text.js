// @flow

import { Platform } from 'react-native'

import { type Theme } from '../types'
import variables from '../variables'
import { makeFontStyleObject } from '../fonts'

export default (): Theme => {
  const theme = {
    '.link': {
      ...makeFontStyleObject(Platform.OS, variables.textLinkWeight),
      color: variables.textLinkColor
    },

    lineHeight: variables.lineHeight
  }

  return theme
}
