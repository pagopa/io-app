/**
 * Utility functions to manage font properties to style mapping for both iOS and Android
 * Fonts are managed differently on Android and iOS. Read the Font section of the
 * README file included in this repository.
 */

import { Platform, PlatformOSType, PlatformStatic } from 'react-native'

type PlatformSelectType = PlatformStatic['select']

const font = Platform.select({
  android: 'TitilliumWeb',
  ios: 'Titillium Web'
})

export const fontWeights = {
  '300': 'Light',
  '400': 'Regular',
  '600': 'SemiBold',
  '700': 'Bold'
}

export type FontWeight = keyof typeof fontWeights

export type FontStyleObject = {
  fontFamily: string
  fontWeight?: string
  fontStyle?: string
}

/**
 * Get the correct fontFamily name on both Android and iOS
 */
export const makeFontFamilyName = (
  osSelect: PlatformSelectType,
  weight: FontWeight | null = '400',
  isItalic: boolean | null = false
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
  osSelect: PlatformSelectType,
  weight: FontWeight | null = '400',
  isItalic: boolean | null = false
): FontStyleObject =>
  osSelect({
    android: {
      fontFamily: makeFontFamilyName(osSelect, weight, isItalic)
    },
    ios: {
      fontFamily: makeFontFamilyName(osSelect, weight, isItalic),
      fontWeight: weight,
      fontStyle: isItalic ? 'italic' : 'normal'
    }
  })
