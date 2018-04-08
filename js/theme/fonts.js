/**
 * Utility class to manage font properties to style mapping for both iOS and Android
 *
 * @flow
 */

import { Platform } from 'react-native'

const font = 'TitilliumWeb'

const fontWeights = {
  '300': 'Light',
  '400': 'Regular',
  '600': 'SemiBold',
  '700': 'Bold'
}

type FontWeight = $Keys<typeof fontWeights>

type FontStyleObject = {
  fontFamily: string,
  fontWeight?: string,
  style?: 'normal' | 'italic'
}

export const makeFontStyleObject = (
  weight?: FontWeight = '400',
  italic?: boolean = false
): FontStyleObject => {
  if (Platform.OS === 'android') {
    return {
      fontFamily: font + '-' + fontWeights[weight] + (italic ? 'Italic' : '')
    }
  } else {
    return {
      fontFamily: font,
      fontWeight: weight,
      style: italic ? 'italic' : 'normal'
    }
  }
}

export const makeFontFamilyName = (
  weight?: FontWeight = '400',
  italic?: boolean = false
): string => {
  if (Platform.OS === 'android') {
    return font + '-' + fontWeights[weight] + (italic ? 'Italic' : '')
  } else {
    return font
  }
}
