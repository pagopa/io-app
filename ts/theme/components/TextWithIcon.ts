import { Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    '.danger': {
      'NativeBase.Text': {
        color: variables.brandDanger
      },

      'NativeBase.Icon': {
        color: variables.brandDanger
      }
    },

    '.success': {
      'NativeBase.Text': {
        color: variables.brandSuccess
      },

      'NativeBase.Icon': {
        color: variables.brandSuccess
      }
    },

    'NativeBase.Text': {
      paddingHorizontal: 5
    },

    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center'
  }

  return theme
}
