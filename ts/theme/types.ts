// A generic recursive type for the theme
export type Theme = {
  [key: string]: Theme | ThemeSimpleValue;
};

export type ThemeSimpleValue = number | string | undefined;
