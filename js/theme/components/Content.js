// @flow

import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    padding: variables.contentPadding,
    backgroundColor: variables.contentBackground
  }

  return theme
}
