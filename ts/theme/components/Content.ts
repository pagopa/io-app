import { Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    '.alternative': {
      backgroundColor: variables.contentAlternativeBackground
    },
    padding: variables.contentPadding,
    backgroundColor: variables.contentBackground
  }

  return theme
}
