import { Platform } from 'react-native'

import { Theme } from '../types'
import variables from '../variables'
import { makeFontStyleObject } from '../fonts'

export default (): Theme => {
  const theme = {
    ...makeFontStyleObject(Platform.select, variables.h1FontWeight),
    color: variables.h1Color
  }

  return theme
}
