// @flow

import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    fontWeight: variables.h1FontWeight
  }

  return theme
}
