import { HeaderActionProps } from "@io-app/design-system";
import I18n from "i18next";
import { useMemo } from "react";

import { useStartSupportRequest } from "./useStartSupportRequest";

/**
 * This hook returns a prop object to be applied to the headers (both first and
 * second level)
 */
export const useHeaderFirstLevelActionPropHelp = (): HeaderActionProps => {
  const startSupportRequest = useStartSupportRequest();

  return useMemo(
    () => ({
      icon: "help",
      accessibilityLabel: I18n.t(
        "global.accessibility.contextualHelp.open.label"
      ),
      onPress: startSupportRequest
    }),
    [startSupportRequest]
  );
};
