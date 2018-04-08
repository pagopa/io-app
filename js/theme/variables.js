/**
 * This file imports all the variables defined inside the native-base material
 * theme than overwrites or add more variables. The combined variables are
 * exported to be used in our components theme files (check `./components` directory).
 *
 * @flow
 */

import materialVariables from 'native-base/src/theme/variables/material'

import { type ThemeSimpleValue } from './types'
import { makeFontStyleObject } from './fonts'

const customVariables = Object.assign(materialVariables, {
  // Android
  btnUppercaseAndroidText: false,

  // Button
  btnTextFontWeight: '600',
  btnHeight: 48,
  btnFontSize: 16,
  btnSmallHeight: 39,
  btnSmallFontSize: 16,
  get btnLightTextColor(): ThemeSimpleValue {
    return this.textColor
  },
  btnLightBorderColor: '#E6E9F2',

  // Color
  brandPrimary: '#0066CC',
  brandPrimaryInverted: '#FFFFFF',
  brandGray: '#F5F6F7',
  brandLight: '#FCFDFF',

  // Font
  ...makeFontStyleObject(),
  fontSizeBase: 16,
  lineHeight: 30,

  // Icon
  iconFamily: 'Entypo',

  // Content
  contentPadding: 24,
  contentBackground: '#FFFFFF',
  get contentInvertedBackground(): ThemeSimpleValue {
    return this.brandGray
  },

  // Footer
  footerBackground: '#FFFFFF',
  footerShadowWidth: 1,
  footerShadowColor: '#D8D8D8',
  footerPaddingTop: 24,
  footerPaddingLeft: 24,
  footerPaddingBottom: 16,
  footerPaddingRight: 24,

  // Grid
  gridGutter: 10,

  // H1
  h1Color: '#17324D',
  h1FontWeight: '600',

  // Header
  headerPaddingHorizontal: 24,
  headerBorderBottomWidth: 0,
  headerBodyFontSize: 14,
  headerBodyFontWeight: '600',
  toolbarDefaultBg: '#FFFFFF',
  get toolbarTextColor(): ThemeSimpleValue {
    return this.textColor
  },
  get toolbarBtnColor(): ThemeSimpleValue {
    return this.textColor
  },

  // Modal
  modalMargin: 0,
  modalPadding: 24,
  modalHeaderHeight: 75,

  // Text
  textColor: '#5C6F82',
  textLinkColor: '#0063CF',

  // Spacer
  spacerHeight: 16,
  spacerLargeHeight: 24,

  borderRadiusBase: 4
})

export default customVariables
