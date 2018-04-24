/**
 * Common styles used across the components
 *
 * @flow
 */

import { Platform, NativeModules, StyleSheet } from 'react-native'

const { StatusBarManager } = NativeModules

// eslint-disable-next-line no-magic-numbers
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT

// Due to a bug, the following style must be wrapped
// with a call to StyleSheet.flatten()
// https://github.com/shoutem/ui/issues/51

const CommonStyles = StyleSheet.create({
  fullContainer: {
    marginTop: STATUSBAR_HEIGHT,
    backgroundColor: '#fafafa'
  },
  errorContainer: {
    padding: 5,
    backgroundColor: '#F23333',
    borderRadius: 4,
    color: '#eee',
    fontSize: 15
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

const PortfolioStyles = StyleSheet.create({
  pftext: {
    fontFamily: 'Titillium Web',
    color: '#fafafa'
  },
  pftitle: {
    fontFamily: 'Titillium Web',
    fontWeight: 'bold',
    fontSize: 30,
    color: '#fafafa'
  },
  pfsubtitle: {
    fontFamily: 'Titillium Web',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fafafa'
  },
  pfbold: {
    fontFamily: 'Titillium Web',
    fontWeight: 'bold',
    color: 'rgb(30,30,30)'
  },
  pfwhy: {
    fontFamily: 'Titillium Web',
    fontWeight: 'bold',
    color: '#3a3bfa'
  },
  pfback: {
    backgroundColor: '#4a5761'
  },
  pfwhite: {
    backgroundColor: '#fafafa'
  },
  container: {
    flex: 1
  },
  pfcards: {
    height: 120,
    marginLeft: -200,
    resizeMode: 'contain'
  },
  pftabcard: {
    height: 120,
    marginLeft: -170,
    resizeMode: 'contain'
  },
  pfsingle: {
    height: 60,
    marginLeft: -190,
    marginTop: 45,
    resizeMode: 'contain'
  }
})

module.exports = {
  CommonStyles,
  ProfileStyles,
  PortfolioStyles
}
