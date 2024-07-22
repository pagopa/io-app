import { Divider, IOStyles } from "@pagopa/io-app-design-system";
import * as React from "react";
import { FlatList } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { FimsHistoryListItem } from "../components/ListItem";
import { LoadingFimsHistoryItemsFooter } from "../components/Loaders";
import { fimsHistoryGet } from "../store/actions";
import {
  fimsHistoryToUndefinedSelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();
  const isLoading = useIOSelector(isFimsHistoryLoadingSelector);
  const consents = useIOSelector(fimsHistoryToUndefinedSelector);

  React.useEffect(() => {
    dispatch(fimsHistoryGet.request({ isFirstRequest: true }));
  }, [dispatch]);

  const fetchMore = React.useCallback(() => {
    if (consents?.continuationToken) {
      dispatch(
        fimsHistoryGet.request({
          continuationToken: consents.continuationToken,
          isFirstRequest: false
        })
      );
    }
  }, [consents?.continuationToken, dispatch]);

  const renderLoadingFooter = () =>
    isLoading ? (
      <LoadingFimsHistoryItemsFooter
        showFirstDivider={(consents?.items.length ?? 0) > 0}
      />
    ) : null;

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("FIMS.history.historyScreen.header")
      }}
      description={I18n.t("FIMS.history.historyScreen.body")}
      canGoback={true}
      headerActionsProp={{ showHelp: true }}
      contextualHelp={emptyContextualHelp}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("FIMS.history.exportData.CTA"),
          onPress: () => null // full export functionality coming soon
        }
      }}
    >
      <FlatList
        onEndReachedThreshold={0.5}
        nestedScrollEnabled={false}
        data={consents?.items}
        contentContainerStyle={IOStyles.horizontalContentPadding}
        ItemSeparatorComponent={Divider}
        keyExtractor={item => item.id}
        renderItem={item => <FimsHistoryListItem item={item.item} />}
        onEndReached={fetchMore}
        ListFooterComponent={renderLoadingFooter}
      />
    </IOScrollViewWithLargeHeader>
  );
};
