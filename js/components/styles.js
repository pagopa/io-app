/**
 * Common styles used across the components
 *
 * @flow
 */

'use strict'

import { Platform, NativeModules, StyleSheet } from 'react-native'

const { StatusBarManager } = NativeModules

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT

// Due to a bug, the following style must be wrapped
// with a call to StyleSheet.flatten()
// https://github.com/shoutem/ui/issues/51

const CommonStyles = StyleSheet.create({
  fullContainer: {
    marginTop: STATUSBAR_HEIGHT,
    backgroundColor: '#fafafa'
  },
  titleFont: {
    fontSize: 36,
    color: '#13253C',
    fontWeight: 'bold'
  },
  textFont: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A5B6F'
  },
  textButton: {
    fontSize: 16,
    lineHeight: 24,
    color: 'white'
  },
  textLink: {
    fontSize: 16,
    lineHeight: 24,
    color: '#004BC4',
    fontWeight: 'bold'
  }
})

const ProfileStyles = StyleSheet.create({
  profileHeader: {
    backgroundColor: '#0066CC'
  },
  profileHeaderText: {
    fontSize: 22,
    color: '#fff'
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileRowIcon: {
    marginLeft: 10,
    fontSize: 13,
    color: '#b2d0ed'
  },
  profileRowText: {
    fontSize: 15,
    color: '#b2d0ed'
  },
  preferenceHeaderText: {
    fontWeight: 'bold',
    color: '#555',
    fontSize: 15,
    marginTop: 10
  },
  listItem: {
    color: '#06C',
    fontWeight: 'bold',
    marginLeft: 20
  },
  version: {
    textAlign: 'right'
  }
})

const PrivacyStyle = StyleSheet.create({
  content: {
    backgroundColor: '#D8D8D8',
    flex: 1,
    paddingLeft: 24,
    paddingRight: 24
  },
  closeModal: {
    fontSize: 30,
    textAlign: 'right',
    paddingTop: 40,
    color: '#17324D'
  },
  title: {
    paddingTop: 50
  },
  mainText: {
    paddingTop: 15
  }
})

module.exports = {
  CommonStyles,
  ProfileStyles,
  PrivacyStyle
}
