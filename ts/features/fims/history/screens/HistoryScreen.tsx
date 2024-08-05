import { Body, Divider, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, FlatList, SafeAreaView, View } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { FimsHistoryListItem } from "../components/FimsHistoryListItem";
import { LoadingFimsHistoryItemsFooter } from "../components/FimsHistoryLoaders";
import { fimsHistoryExport, fimsHistoryGet } from "../store/actions";
import {
  fimsHistoryToUndefinedSelector,
  fimsIsExportingHistorySelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();
  const isLoading = useIOSelector(isFimsHistoryLoadingSelector);
  const consents = useIOSelector(fimsHistoryToUndefinedSelector);
  const isExportingHistory = useIOSelector(fimsIsExportingHistorySelector);

  React.useEffect(() => {
    dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }));
  }, [dispatch]);

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

  const handleExportOnPress = () =>
    Alert.alert(
      I18n.t("FIMS.history.exportData.alerts.areYouSure"),
      undefined,
      [
        { text: I18n.t("global.buttons.cancel"), style: "cancel" },
        {
          text: I18n.t("global.buttons.confirm"),
          isPreferred: true,
          onPress: () => {
            dispatch(fimsHistoryExport.request());
          }
        }
      ]
    );

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
            loading: isExportingHistory,
            label: I18n.t("FIMS.history.exportData.CTA"),
            onPress: handleExportOnPress
          }
        }}
      />
    </>
  );
};
