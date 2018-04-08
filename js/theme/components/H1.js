// @flow

import { type Theme } from '../types'
import variables from '../variables'
import { makeFontStyleObject } from '../fonts'

export default (): Theme => {
  const theme = {
    color: variables.h1Color,
    ...makeFontStyleObject(variables.h1FontWeight)
  }

  return theme
}
