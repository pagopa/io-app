import {
  Body,
  Divider,
  IOStyles,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, FlatList, SafeAreaView, View } from "react-native";
import * as RemoteValue from "../../../../common/model/RemoteValue";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsRequiresAppUpdateSelector } from "../../../../store/reducers/backendStatus";
import { openAppStoreUrl } from "../../../../utils/url";
import { FimsHistoryListItem } from "../components/FimsHistoryListItem";
import { LoadingFimsHistoryItemsFooter } from "../components/FimsHistoryLoaders";
import { fimsHistoryExport, fimsHistoryGet } from "../store/actions";
import {
  fimsHistoryErrorSelector,
  fimsHistoryExportStateSelector,
  fimsHistoryToUndefinedSelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";
import { useFimsHistoryResultToasts } from "../utils/useFimsHistoryResultToasts";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();

  const requiresAppUpdate = useIOSelector(fimsRequiresAppUpdateSelector);
  const isHistoryLoading = useIOSelector(isFimsHistoryLoadingSelector);
  const consents = useIOSelector(fimsHistoryToUndefinedSelector);
  const historyExportState = useIOSelector(fimsHistoryExportStateSelector);
  const historyErrorState = useIOSelector(fimsHistoryErrorSelector);
  // ---------- HOOKS

  const fetchMore = React.useCallback(() => {
    if (consents?.continuationToken && historyErrorState === undefined) {
      dispatch(
        fimsHistoryGet.request({
          continuationToken: consents.continuationToken
        })
      );
    }
  }, [consents?.continuationToken, historyErrorState, dispatch]);

  useHeaderSecondLevel({
    title: I18n.t("FIMS.history.historyScreen.header"),
    supportRequest: true
  });

  React.useEffect(() => {
    if (!requiresAppUpdate) {
      dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }));
    }
  }, [dispatch, requiresAppUpdate]);

  useFimsHistoryResultToasts();

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
  // ---------- HISTORY ERROR STATES

  if (historyErrorState) {
    if (historyErrorState === "FULL_KO") {
      return <OperationResultScreenContent title="ERROR ERORRO" />;
    }
    IOToast.error("ERROR ERROR");
  }

  // ---------- EXPORT LOGIC

  const isHistoryExporting = RemoteValue.isLoading(historyExportState);

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
