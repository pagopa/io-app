import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";

export const useItwStatusIconColor = (expired: boolean): IOColors => {
  const theme = useIOTheme();
  return expired ? theme["icon-decorative"] : theme["interactiveElem-default"];
};
