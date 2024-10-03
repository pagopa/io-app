import { useEffect, useState } from "react";
import { Action } from "typesafe-actions";
import { useIOSelector } from "../../../store/hooks";
import { fastLoginPendingActionsSelector } from "../../fastLogin/store/selectors";

/**
 * This custom hook runs the callback everytime the user session refreshes.
 * It's considered to use the pending actions as a trigger to understand when the session is refreshed,
 * because if there are pending actions, it means that the user has received 401 in one of the recent requests and the session has been refreshed.
 *
 * @param callback
 */
export const useOnWalletUserSessionRefresh = (callback: () => void) => {
  const sessionPendingActions = useIOSelector(fastLoginPendingActionsSelector);
  const [previousPendingActions, setPreviousPendingActions] = useState<
    Array<Action>
  >([]);

  useEffect(() => {
    if (
      sessionPendingActions.length === 0 &&
      previousPendingActions.length > 0
    ) {
      setPreviousPendingActions([]);
      callback();
    } else if (sessionPendingActions.length > 0) {
      setPreviousPendingActions(sessionPendingActions);
    }
  }, [sessionPendingActions, previousPendingActions, callback]);
};
