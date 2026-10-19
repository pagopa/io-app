import { IOColorsLegacy, useIOTheme } from "@io-app/design-system";

export const useItwStatusIconColor = (expired: boolean): IOColorsLegacy => {
  const theme = useIOTheme();
  return expired ? theme["icon-decorative"] : theme["interactiveElem-default"];
};
