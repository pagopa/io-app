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
    backgroundColor: variables.fullContainerBackgroundColor
  },
  header: {
    backgroundColor: variables.headerBackgroundColor,
    borderBottomColor: variables.headerBorderBottomColor
  },
  leftHeader: {
    flex: variables.leftFlexValue
  },
  iconChevronLeft: {
    color: variables.iconColor
  },
  pageContent: {
    paddingTop: variables.contentPaddingTop,
    paddingLeft: variables.contentPaddingLeft,
    paddingRight: variables.contentPaddingRight,
    backgroundColor: variables.contentBackgroudColor
  },
  titleFont: {
    textAlign: variables.titleAlign,
    fontWeight: variables.titleFontWeight
  },
  mainTitleFont: {
    fontSize: variables.mainTitleFontSize,
    color: variables.mainTitleFontColor,
    fontWeight: variables.mainTitleFontWeight,
    textAlign: variables.mainTitleFontAlign
  },
  mainText: {
    fontSize: variables.textFontSize,
    color: variables.textColor
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
  // Global style for the container used to show errors in the app
  errorContainer: {
    padding: variables.errorContainerPadding,
    backgroundColor: variables.errorContainerBackgroundColor,
    borderRadius: variables.errorContainerBorderRadius,
    color: variables.errorContainerFontColor,
    fontSize: variables.errorContainerFontSize
  },
  // Global style for the icon for close the modal
  icon: {
    fontSize: variables.iconFontSize,
    color: variables.iconColor
  },
  buttonFooter: {
    justifyContent: 'center',
    height: variables.footerButtonHeight,
    width: variables.footerButtonWidth,
    borderRadius: variables.footerButtonBorderRadius,
    backgroundColor: variables.footerButtonBackgroundColor
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

module.exports = {
  CommonStyles,
  ProfileStyles
}
