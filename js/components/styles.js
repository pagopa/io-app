
/**
 * @flow
 */

'use strict'

import {
	Platform, NativeModules, StyleSheet
} from 'react-native'

const { StatusBarManager } = NativeModules

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT

// Per via di un bug, bisogna usare StyleSheet.flatten
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
