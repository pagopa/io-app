import { Platform } from 'react-native'

import { Theme } from '../types'
import variables from '../variables'
import { makeFontStyleObject } from '../fonts'

export default (): Theme => {
  const theme = {
    'NativeBase.Left': {
      flex: 0.2
    },
    'NativeBase.Body': {
      'NativeBase.Text': {
        ...makeFontStyleObject(Platform.select, variables.headerBodyFontWeight),
        backgroundColor: 'transparent',
        color: variables.toolbarTextColor,
        fontSize: variables.headerBodyFontSize
      }
    },

    borderBottomWidth: variables.headerBorderBottomWidth,
    elevation: 0,
    paddingHorizontal: variables.headerPaddingHorizontal,
    shadowColor: null,
    shadowOffset: null,
    shadowOpacity: null,
    shadowRadius: null
  }

  return theme
}
