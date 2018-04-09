/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 *
 * @flow
 */

import { Platform } from 'react-native'

const font = Platform.OS === 'android' ? 'TitilliumWeb' : 'Titillium Web'

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
  os: string,
  weight?: FontWeight = '400',
  isItalic?: boolean = false
): string => {
  if (os === 'android') {
    return `${font}-${fontWeights[weight]}${isItalic ? 'Italic' : ''}`
  } else {
    return font
  }
}

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
      fontFamily: makeFontFamilyName(os, weight, isItalic)
    }
  } else {
    return {
      fontFamily: makeFontFamilyName(os, weight, isItalic),
      fontWeight: weight,
      fontStyle: isItalic ? 'italic' : 'normal'
    }
  }
}
