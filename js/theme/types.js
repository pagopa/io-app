// @flow

// A generic recursive type for the theme
export type Theme = {
  [key: string]: null | number | string | Theme
}
