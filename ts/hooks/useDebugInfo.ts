import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { resetDebugData, setDebugData } from "../store/actions/debug";
import { useIODispatch, useIOSelector } from "../store/hooks";
import { isDebugModeEnabledSelector } from "../store/reducers/debug";

/**
 * Sets debug data for the mounted component. Removes it when the component is unmounted
 * @param data Data to be displayes in debug mode
 */
export const useDebugInfo = (data: Record<string, unknown>) => {
  const dispatch = useIODispatch();
  const isDebug = useIOSelector(isDebugModeEnabledSelector);

  useFocusEffect(
    useCallback(() => {
      // Avoids storing debug data if debug is disabled
      if (!isDebug) {
        return undefined;
      }

      dispatch(setDebugData(data));

      return () => {
        dispatch(resetDebugData(Object.keys(data)));
      };
    }, [dispatch, isDebug, data])
  );
};
