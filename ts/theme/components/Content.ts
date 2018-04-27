import { Theme } from '../types'
import variables from '../variables'


declare module 'native-base' {
  namespace NativeBase {
    interface Content {
      alternative?: boolean
    }
  }
}

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
