/* eslint-disable functional/immutable-data */
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { NavigationContext } from "react-navigation";

const retryTimeout = 5000 as Millisecond;

/**
 * Load the pot value using the loadAction until is some. Automatically retry using the {@link retryTimeout}
 * @param id - the loadRequestId. Should be always the same for the same pot and different, for different pots.
 * @param potValue - the value that we would ensure that should be loaded
 * @param loadAction - the action that trigger the load of the pot
 */
export const useLoadPotValue = <T, E>(
  id: string,
  potValue: pot.Pot<T, E>,
  loadAction: () => void
) => {
  const [idState, setId] = useState("");
  const timerRetry = useRef<number | undefined>(undefined);
  const navigation = useContext(NavigationContext);
  const retry = useCallback(() => {
    timerRetry.current = undefined;
    loadAction();
  }, [loadAction]);
  const isFocused = navigation.isFocused();

  /**
   * When the focus change or the idRequest changes, clear the timer (if any)
   * and reset the value to undefined.
   * focus: true  -> a new schedule is allowed
   * focus: false -> clear all the pending schedule
   */
  useEffect(() => {
    clearTimeout(timerRetry.current);
    timerRetry.current = undefined;
  }, [isFocused, idState]);

  useEffect(() => {
    setId(id);
    // Initial state, request the state
    if (potValue === pot.none) {
      loadAction();
    } else if (
      pot.isNone(potValue) &&
      pot.isError(potValue) &&
      timerRetry.current === undefined &&
      isFocused
    ) {
      // If the pot is NoneError, the navigation focus is on the element
      // and no other retry are scheduled
      timerRetry.current = setTimeout(retry, retryTimeout);
    }
  }, [potValue, isFocused, idState, id, loadAction, retry]);

  // Component unmount, clear scheduled
  useEffect(
    () => () => {
      clearTimeout(timerRetry.current);
    },
    []
  );
};
