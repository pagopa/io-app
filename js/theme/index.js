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
import h1Theme from './components/H1'
import headerTheme from './components/Header'
import itemTheme from './components/Item'
import modalTheme from './components/Modal'
import textTheme from './components/Text'
import viewTheme from './components/View'

const theme = (): Theme => {
  const nbTheme = getTheme(variables)
  const overrides = {
    'NativeBase.Button': {
      ...buttonTheme()
    },
    'NativeBase.Content': {
      ...contentTheme()
    },
    'NativeBase.H1': {
      ...h1Theme()
    },
    'NativeBase.Header': {
      ...headerTheme()
    },
    'NativeBase.Item': {
      ...itemTheme()
    },
    'UIComponents.Modal': {
      ...modalTheme()
    },
    'NativeBase.Text': {
      ...textTheme()
    },
    'NativeBase.ViewNB': {
      ...viewTheme()
    }
  }

  // We need ad deep merge
  return merge(nbTheme, overrides)
}

export default theme
