import { Millisecond } from "italia-ts-commons/lib/units";
import { useContext, useEffect, useState } from "react";
import { NavigationContext } from "react-navigation";

/**
 * Call the action when the component isFocused() and dontExecuteBefore has passed since the last update.
 * @param loadAction
 * @param dontExecuteBefore
 */
export const useActionOnFocus = (
  loadAction: () => void,
  dontExecuteBefore: Millisecond | undefined = undefined
) => {
  const [lastUpdate, setLastUpdate] = useState<Date | undefined>(undefined);

  const navigation = useNavigationContext();
  useEffect(() => {
    const now = new Date();
    const shouldRefreshDelay =
      dontExecuteBefore === undefined ||
      lastUpdate === undefined ||
      now.getTime() - lastUpdate.getTime() > dontExecuteBefore;

    if (navigation.isFocused() && shouldRefreshDelay) {
      loadAction();
      setLastUpdate(now);
    }
  }, [navigation.isFocused()]);
};

export const useNavigationContext = () => useContext(NavigationContext);
