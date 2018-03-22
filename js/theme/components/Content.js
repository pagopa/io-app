// @flow

import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    padding: 24,
    backgroundColor: variables.contentBackground
  }

  return theme
}
