import { Platform } from 'react-native'

import { Theme } from '../types'
import variables from '../variables'
import { makeFontStyleObject } from '../fonts'

export default (): Theme => {
  const theme = {
    ...makeFontStyleObject(Platform.select, variables.h3FontWeight),
    color: variables.h3Color,
    //eslint-disable-next-line no-magic-numbers
    fontSize: variables.fontSizeBase * 1.25
  }

  return theme
}
