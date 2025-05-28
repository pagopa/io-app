import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";

export const useAppBackgroundAccentColor = (): IOColors => {
  const theme = useIOTheme();
  return theme["appBackground-accent"];
};

export const useAppBackgroundAccentColorName = (): string => {
  const color = useAppBackgroundAccentColor();
  return IOColors[color];
};

export const useInteractiveElementDefaultColor = (): IOColors => {
  const theme = useIOTheme();
  return theme["interactiveElem-default"];
};

export const useInteractiveElementDefaultColorName = (): string => {
  const color = useInteractiveElementDefaultColor();
  return IOColors[color];
};

export const useAppBackgroundPrimaryColor = (): IOColors => {
  const theme = useIOTheme();
  return theme["appBackground-primary"];
};

export const useAppBackgroundPrimaryColorName = (): string => {
  const color = useAppBackgroundPrimaryColor();
  return IOColors[color];
};
