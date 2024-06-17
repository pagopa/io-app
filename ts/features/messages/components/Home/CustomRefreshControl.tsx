import React, { useCallback } from "react";
import { RefreshControl } from "react-native";
import { IOColors } from "@pagopa/io-app-design-system";
import { MessageListCategory } from "../../types/messageListCategory";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { shouldShowRefreshControllOnListSelector } from "../../store/reducers/allPaginated";
import { getReloadAllMessagesActionForRefreshIfAllowed } from "./homeUtils";

export type RefreshControlProps = {
  category: MessageListCategory;
};

export const CustomRefreshControl = ({ category }: RefreshControlProps) => {
  const store = useIOStore();
  const dispatch = useIODispatch();

  const isRefreshing = useIOSelector(state =>
    shouldShowRefreshControllOnListSelector(state, category)
  );

  const onRefreshCallback = useCallback(() => {
    const state = store.getState();
    const reloadAllMessagesAction =
      getReloadAllMessagesActionForRefreshIfAllowed(state, category);
    if (reloadAllMessagesAction) {
      dispatch(reloadAllMessagesAction);
    }
  }, [category, dispatch, store]);

  return (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefreshCallback}
      tintColor={IOColors["blueIO-500"]}
      colors={[IOColors["blueIO-500"]]}
      testID={`custom_refresh_control_${category.toLowerCase()}`}
    />
  );
};
