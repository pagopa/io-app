import { Body, Divider, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsRequiresAppUpdateSelector } from "../../../../store/reducers/backendStatus";
import { openAppStoreUrl } from "../../../../utils/url";
import { FimsHistoryListItem } from "../components/FimsHistoryListItem";
import { LoadingFimsHistoryItemsFooter } from "../components/FimsHistoryLoaders";
import { fimsHistoryGet } from "../store/actions";
import {
  fimsHistoryExportStateSelector,
  fimsHistoryToUndefinedSelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";
import { useFimsHistoryExport } from "../utils/useFimsHistoryResultToasts";
import * as RemoteValue from "../../../../common/model/RemoteValue";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();

  const requiresAppUpdate = useIOSelector(fimsRequiresAppUpdateSelector);
  const isHistoryLoading = useIOSelector(isFimsHistoryLoadingSelector);
  const consents = useIOSelector(fimsHistoryToUndefinedSelector);
  const historyExportState = useIOSelector(fimsHistoryExportStateSelector);
  const isHistoryExporting = RemoteValue.isLoading(historyExportState);

  // ---------- HOOKS

  const fetchMore = React.useCallback(() => {
    if (consents?.continuationToken) {
      dispatch(
        fimsHistoryGet.request({
          continuationToken: consents.continuationToken
        })
      );
    }
  }, [consents?.continuationToken, dispatch]);

  useHeaderSecondLevel({
    title: I18n.t("FIMS.history.historyScreen.header"),
    supportRequest: true
  });

  React.useEffect(() => {
    if (!requiresAppUpdate) {
      dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }));
    }
  }, [dispatch, requiresAppUpdate]);

  const { handleExportOnPress } = useFimsHistoryExport();

  // ---------- APP UPDATE

  if (requiresAppUpdate) {
    return (
      <OperationResultScreenContent
        isHeaderVisible
        title={I18n.t("titleUpdateAppAlert")}
        pictogram="umbrellaNew"
        action={{
          label: I18n.t("btnUpdateApp"),
          onPress: () => openAppStoreUrl
        }}
      />
    );
  }

  // ---------- RENDER

  const renderLoadingFooter = () =>
    isHistoryLoading ? (
      <LoadingFimsHistoryItemsFooter
        showFirstDivider={(consents?.items.length ?? 0) > 0}
      />
    ) : null;

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
            loading: isHistoryExporting,
            label: I18n.t("FIMS.history.exportData.CTA"),
            onPress: handleExportOnPress
          }
        }}
      />
    </>
  );
};
