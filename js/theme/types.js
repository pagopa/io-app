// @flow

export type ThemeSimpleValue = null | number | string

// A generic recursive type for the theme
export type Theme = {
  [key: string]: ThemeSimpleValue | Theme
}
