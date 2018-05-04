import { Platform } from 'react-native'

import { Theme } from '../types'
import variables from '../variables'
import { makeFontStyleObject } from '../fonts'

import * as ReactNative from 'react-native'

declare module 'native-base' {
  namespace NativeBase {
    interface Text extends ReactNative.TextProperties {
      link?: boolean,
      item?: boolean,
      bold?: boolean,
      dateFormat?: boolean
    }
  }
}

export default (): Theme => {
  const theme = {
    '.link': {
      ...makeFontStyleObject(Platform.select, variables.textLinkWeight),
      color: variables.textLinkColor
    },
    '.bold': {
      //lineHeight: variables.textBoldLineHeight,
      fontWeight: variables.textBoldWeight,
      color: variables.h1Color
    },
    '.dateFormat': {
      fontWeight: 'bold',
      fontSize: variables.dateTextFontSize,
    },

    lineHeight: variables.lineHeight
  }

  return theme
}
