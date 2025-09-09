import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import { useMemo } from "react";

export const useItwStatusIconColor = (expired: boolean): IOColors => {
  const theme = useIOTheme();
  return useMemo(
    () =>
      expired ? theme["icon-decorative"] : theme["interactiveElem-default"],
    [expired, theme]
  );
};
