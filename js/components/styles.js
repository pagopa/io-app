/**
 * Common styles used across the components
 *
 * @flow
 */

'use strict'

import { Platform, NativeModules, StyleSheet } from 'react-native'

const { StatusBarManager } = NativeModules

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT

import variables from '../../style/variables/agidStyle'

// Due to a bug, the following style must be wrapped
// with a call to StyleSheet.flatten()
// https://github.com/shoutem/ui/issues/51

const CommonStyles = StyleSheet.create({
  fullContainer: {
    marginTop: STATUSBAR_HEIGHT,
    backgroundColor: '#fafafa'
  },
  header: {
    backgroundColor: variables.headerBackgroundColor,
    borderBottomColor: variables.headerBorderButtomColor
  },
  leftHeader: {
    flex: variables.leftFlexValue
  },
  iconChevronLeft: {
    color: variables.iconChevronLeftColor
  },
  pageContent: {
    paddingTop: variables.contentPaddingTop,
    paddingLeft: variables.contentPaddingLeft,
    paddingRight: variables.contentPaddingRigth,
    backgroundColor: variables.contentBackgroudColor
  },
  titleFont: {
    textAlign: variables.titleAlign,
    fontWeight: variables.titleFontWeight
  },
  mainTitlteFont: {
    fontSize: variables.mainTitleFontSize,
    color: variables.mainTitleFontColor,
    fontWeight: variables.mainTitleFontWeight,
    textAlign: variables.mainTitleFontAlign
  },
  textButton: {
    fontSize: variables.buttonTextFontSize,
    lineHeight: variables.buttonTextLineHeight,
    color: variables.buttonTextColor
  },
  textLink: {
    fontSize: variables.linkTextFontSize,
    lineHeight: variables.linkTextLineHeight,
    color: variables.linkTextColor,
    fontWeight: variables.linkTextFontWeight
  },
  errorContainer: {
    padding: 5,
    backgroundColor: '#F23333',
    borderRadius: 4,
    color: '#eee',
    fontSize: 15
  },
  buttonFooter: {
    justifyContent: 'center',
    height: 40,
    width: 300,
    borderRadius: 4,
    backgroundColor: '#0073e6'
  },
  buttonFooterContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  footer: {
    height: variables.footerHeight,
    backgroundColor: variables.footerBackgroundColor,
    flexDirection: 'column',
    justifyContent: 'center'
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

const NoSpidScreenStyle = StyleSheet.create({
  contentFirstView: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textLink: {
    position: 'relative',
    left: 0
  },
  modalText: {
    position: 'relative',
    left: 0
  },
  marginModal: {
    marginTop: 5
  },
  paddingModal: {
    paddingTop: 15
  },
  paddingSubtitle: {
    paddingTop: 10
  }
})

module.exports = {
  CommonStyles,
  ProfileStyles,
  PrivacyStyle,
  NoSpidScreenStyle
}
