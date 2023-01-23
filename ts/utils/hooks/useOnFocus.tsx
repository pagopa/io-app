import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";

/**
 * Call the action when the component isFocused() and dontExecuteBefore has passed since the last update.
 * TODO: rewrite this component following all the hooks rules
 * @param loadAction
 * @param dontExecuteBefore
 */
export const useActionOnFocus = (
  loadAction: () => void,
  dontExecuteBefore: Millisecond | undefined = undefined
) => {
  const [lastUpdate, setLastUpdate] = useState<Date | undefined>(undefined);
  const isFocused = useIsFocused();

  useEffect(() => {
    const now = new Date();
    const shouldRefreshDelay =
      dontExecuteBefore === undefined ||
      lastUpdate === undefined ||
      now.getTime() - lastUpdate.getTime() > dontExecuteBefore;

    if (isFocused && shouldRefreshDelay) {
      loadAction();
      setLastUpdate(now);
    }
  }, [isFocused]);
};
