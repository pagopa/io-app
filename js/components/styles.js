
/**
 * Common styles used across the components
 *
 * @flow
 */

'use strict'

import {
	Platform, NativeModules, StyleSheet
} from 'react-native'

const { StatusBarManager } = NativeModules

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT

// Due to a bug, the following style must be wrapped
// with a call to StyleSheet.flatten()
// https://github.com/shoutem/ui/issues/51

const CommonStyles = StyleSheet.create({
  fullContainer: {
    marginTop: STATUSBAR_HEIGHT,
    backgroundColor: '#fafafa',
  },
})

const ProfileStyles = StyleSheet.create({
  listItem: {
    color: '#06C',
    fontWeight: 'bold',
    marginLeft: 20,
  },
})

module.exports = {
  CommonStyles,
  ProfileStyles,
}
