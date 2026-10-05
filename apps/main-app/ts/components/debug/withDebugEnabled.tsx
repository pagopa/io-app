import { PropsWithChildren } from "react";

import { useIOSelector } from "../../store/hooks";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";

/** Renders children only when debug mode is enabled. */
export const WithDebugEnabled = ({ children }: PropsWithChildren) => {
  const isDebugEnabled = useIOSelector(isDebugModeEnabledSelector);

  if (!isDebugEnabled) {
    return null;
  }

  return <>{children}</>;
};
