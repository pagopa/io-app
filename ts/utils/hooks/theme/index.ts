import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";

export const useAppBackgroundAccent = () => {
  const theme = useIOTheme();
  return IOColors[theme["appBackground-accent"]];
};
