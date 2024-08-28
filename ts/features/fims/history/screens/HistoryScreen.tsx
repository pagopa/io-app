/* eslint-disable functional/immutable-data */
import { Body, IOStyles, IOToast, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsRequiresAppUpdateSelector } from "../../../../store/reducers/backendStatus";
import { openAppStoreUrl } from "../../../../utils/url";
import { FimsHistoryEmptyContent } from "../components/FimsHistoryEmptyContent";
import { FimsHistoryKoScreen } from "../components/FimsHistoryKoScreen";
import { FimsHistoryNonEmptyContent } from "../components/FimsHistoryNonEmptyContent";
import { fimsHistoryGet } from "../store/actions";
import {
  fimsHistoryErrorSelector,
  fimsHistoryToUndefinedSelector,
  isFimsHistoryLoadingSelector
} from "../store/selectors";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();

  const requiresAppUpdate = useIOSelector(fimsRequiresAppUpdateSelector);
  const consents = useIOSelector(fimsHistoryToUndefinedSelector);
  const historyErrorState = useIOSelector(fimsHistoryErrorSelector);
  const isHistoryLoading = useIOSelector(isFimsHistoryLoadingSelector);

  const lastErrorToastDate = React.useRef<number | null>(null);

  // ---------- HOOKS

  useHeaderSecondLevel({
    title: I18n.t("FIMS.history.historyScreen.header"),
    supportRequest: true
  });

  React.useEffect(() => {
    if (!requiresAppUpdate) {
      dispatch(fimsHistoryGet.request({ shouldReloadFromScratch: true }));
    }
  }, [dispatch, requiresAppUpdate]);

  const fetchMoreHistoryItems = React.useCallback(() => {
    const hasErrorTimeoutExpired = lastErrorToastDate.current
      ? Date.now() - lastErrorToastDate.current >= 500
      : true;

    if (hasErrorTimeoutExpired && consents?.continuationToken) {
      dispatch(
        fimsHistoryGet.request({
          continuationToken: consents.continuationToken
        })
      );
    }
  }, [consents, dispatch]);

  // ---------- FAILURE CASES

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

  switch (historyErrorState) {
    case "FULL_KO":
      return <FimsHistoryKoScreen />;
    case "ALERT_ONLY":
      IOToast.error(I18n.t("FIMS.history.errorStates.toast"));
      lastErrorToastDate.current = Date.now();
  }

  // ---------- SUCCESS

  const shouldShowEmptyContent =
    !isHistoryLoading && (consents?.items ?? []).length === 0;

  return (
    <>
      <View style={IOStyles.horizontalContentPadding}>
        <Body>{I18n.t("FIMS.history.historyScreen.body")}</Body>
      </View>
      <VSpacer size={16} />
      {shouldShowEmptyContent ? (
        <FimsHistoryEmptyContent />
      ) : (
        <FimsHistoryNonEmptyContent
          consents={consents}
          fetchMore={fetchMoreHistoryItems}
        />
      )}
    </>
  );
};
