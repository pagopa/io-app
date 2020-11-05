import { Millisecond } from "italia-ts-commons/lib/units";
import { useContext, useEffect, useState } from "react";
import { NavigationContext } from "react-navigation";

/**
 * Call the action when the component isFocused() and refreshAfter has passed since the last update.
 * @param loadAction
 * @param refreshAfter
 */
export const useOnFocus = (
  loadAction: () => void,
  refreshAfter: Millisecond | undefined = undefined
) => {
  const [lastUpdate, setLastUpdate] = useState<Date | undefined>(undefined);

  const navigation = useContext(NavigationContext);
  useEffect(() => {
    const now = new Date();
    const shouldRefreshDelay =
      refreshAfter === undefined ||
      lastUpdate === undefined ||
      now.getTime() - lastUpdate.getTime() > refreshAfter;

    if (navigation.isFocused() && shouldRefreshDelay) {
      loadAction();
      setLastUpdate(now);
    }
  }, [navigation.isFocused()]);
};

/**
 * An hook to call an action when the component have the focus
 * @param loadAction
 */
export const useRefreshOnFocus = (loadAction: () => void) => {
  const navigation = useContext(NavigationContext);
  useEffect(() => {
    if (navigation.isFocused()) {
      loadAction();
    }
  }, [navigation.isFocused()]);
};
