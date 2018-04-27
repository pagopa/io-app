import { Platform } from 'react-native'

import { Theme } from '../types'
import variables from '../variables'
import { makeFontStyleObject } from '../fonts'

import * as ReactNative from 'react-native'

declare module 'native-base' {
  namespace NativeBase {
    interface Text extends ReactNative.TextProperties {
      link?: boolean
    }
  }
}

export default (): Theme => {
  const theme = {
    '.link': {
      ...makeFontStyleObject(Platform.select, variables.textLinkWeight),
      color: variables.textLinkColor
    },

    lineHeight: variables.lineHeight
  }

  return theme
}
