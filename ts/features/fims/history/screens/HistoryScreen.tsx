import { Body, Divider, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { FimsHistoryListItem } from "../components/FimsHistoryListItem";
import { LoadingFimsHistoryItemsFooter } from "../components/FimsHistoryLoaders";
import { fimsHistoryGet } from "../store/actions";
import {
  fimsHistoryToUndefinedSelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";
import { fimsRequiresAppUpdateSelector } from "../../../../store/reducers/backendStatus";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();

  const requiresAppUpdate = useIOSelector(fimsRequiresAppUpdateSelector);
  const isLoading = useIOSelector(isFimsHistoryLoadingSelector);
  const consents = useIOSelector(fimsHistoryToUndefinedSelector);

  React.useEffect(() => {
    if (!requiresAppUpdate) {
      dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }));
    }
  }, [dispatch, requiresAppUpdate]);

  const fetchMore = React.useCallback(() => {
    if (consents?.continuationToken) {
      dispatch(
        fimsHistoryGet.request({
          continuationToken: consents.continuationToken
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
  useHeaderSecondLevel({
    title: I18n.t("FIMS.history.historyScreen.header"),
    supportRequest: true
  });
  if (requiresAppUpdate) {
    return null;
  }
  return (
    <>
      <SafeAreaView>
        <View style={IOStyles.horizontalContentPadding}>
          <Body>{I18n.t("FIMS.history.historyScreen.body")}</Body>
        </View>

        <VSpacer size={16} />

        <FlatList
          data={consents?.items}
          contentContainerStyle={IOStyles.horizontalContentPadding}
          ItemSeparatorComponent={Divider}
          keyExtractor={item => item.id}
          renderItem={item => <FimsHistoryListItem item={item.item} />}
          onEndReached={fetchMore}
          ListFooterComponent={renderLoadingFooter}
        />
      </SafeAreaView>
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("FIMS.history.exportData.CTA"),
            onPress: constNull // full export functionality coming soon
          }
        }}
      />
    </>
  );
};
