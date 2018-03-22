/**
 * This file imports all the variables defined inside the native-base material
 * theme than overwrites or add more variables. The combined variables are
 * exported to be used in our components theme files (check `./components` directory).
 *
 * @flow
 */

import materialVariables from 'native-base/src/theme/variables/material'

const customVariables = Object.assign(materialVariables, {
  // Android
  btnUppercaseAndroidText: false,

  // Button
  btnFontFamily: 'Titillium Web',
  btnTextFontWeight: '600',
  btnHeight: 48,

  // Color
  brandPrimary: '#0066CC',
  brandPrimaryInverted: '#FFFFFF',

  // Font
  fontFamily: 'Titillium Web',
  fontSizeBase: 16,

  // Icon
  iconFamily: 'Entypo',

  // Content
  contentBackground: '#FFFFFF',

  // Footer
  footerBackground: '#FFFFFF',
  footerShadowWidth: 1,
  footerShadowColor: '#D8D8D8',
  footerPaddingTop: 24,
  footerPaddingLeft: 24,
  footerPaddingBottom: 16,
  footerPaddingRight: 24,

  // Spacer
  spacerHeight: 16,
  spacerLargeHeight: 24,

  borderRadiusBase: 4
})

export default customVariables
