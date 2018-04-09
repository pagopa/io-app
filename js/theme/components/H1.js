// @flow

import { Platform } from 'react-native'

import { type Theme } from '../types'
import variables from '../variables'
import { makeFontStyleObject } from '../fonts'

export default (): Theme => {
  const theme = {
    color: variables.h1Color,
    ...makeFontStyleObject(Platform.select, variables.h1FontWeight)
  }

  return theme
}
