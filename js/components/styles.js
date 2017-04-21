
/**
 * @flow
 */

'use strict'

import {
	Platform, NativeModules, StyleSheet
} from 'react-native'

const { StatusBarManager } = NativeModules

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT

import { TitilliumRegular } from './fonts'

// Per via di un bug, bisogna usare StyleSheet.flatten
// https://github.com/shoutem/ui/issues/51

const CommonStyles = StyleSheet.create({
  fullContainer: {
    marginTop: STATUSBAR_HEIGHT,
  },
})

const ProfileStyles = StyleSheet.create({
  listItemHeader: {
    fontFamily: TitilliumRegular,
  },
  listItem: {
    color: '#06C',
    fontWeight: 'bold',
    fontFamily: TitilliumRegular,
    marginLeft: 20,
  },
})

module.exports = {
  CommonStyles,
  ProfileStyles,
}
