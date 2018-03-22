/**
 * This file exports a function to create the whole theme of the application.
 * It takes our custom variables and mixes them with each defined component theme.
 * @flow
 */

import merge from 'lodash/merge'

import getTheme from 'native-base/src/theme/components'
import { type Theme } from './types'
import variables from './variables'
import buttonTheme from './components/Button'
import contentTheme from './components/Content'
import viewTheme from './components/View'

// eslint-disable-next-line flowtype/no-weak-types
const theme = (): Theme => {
  const nbTheme = getTheme(variables)
  const overrides = {
    'NativeBase.Button': {
      ...buttonTheme()
    },
    'NativeBase.Content': {
      ...contentTheme()
    },
    'NativeBase.ViewNB': {
      ...viewTheme()
    }
  }

  // We need ad deep merge
  return merge(nbTheme, overrides)
}

export default theme
