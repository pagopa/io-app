/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 *
 * @flow
 */

import { Platform } from 'react-native'
import { type PlatformSelectSpec } from 'PlatformOS'

const font = Platform.select({
  android: 'TitilliumWeb',
  ios: 'Titillium Web'
})

const fontWeights = {
  '300': 'Light',
  '400': 'Regular',
  '600': 'SemiBold',
  '700': 'Bold'
}

export type FontWeight = $Keys<typeof fontWeights>

export type FontStyleObject = {
  fontFamily: string,
  fontWeight?: string,
  style?: 'normal' | 'italic'
}

/**
 * Get the correct fontFamily name on both Android and iOS
 */
export const makeFontFamilyName = (
  osSelect: (PlatformSelectSpec<string, string>) => string,
  weight?: FontWeight = '400',
  isItalic?: boolean = false
): string =>
  osSelect({
    android: `${font}-${fontWeights[weight]}${isItalic ? 'Italic' : ''}`,
    ios: font
  })

/**
 * This function returns an object containing all the properties needed to use
 * a Font correctly on both Android and iOS.
 */
export const makeFontStyleObject = (
  os: string,
  weight?: FontWeight = '400',
  isItalic?: boolean = false
): FontStyleObject => {
  if (os === 'android') {
    return {
      fontFamily: makeFontFamilyName(Platform.select, weight, isItalic)
    }
  } else {
    return {
      fontFamily: makeFontFamilyName(Platform.select, weight, isItalic),
      fontWeight: weight,
      fontStyle: isItalic ? 'italic' : 'normal'
    }
  }
}
