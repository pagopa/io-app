import { Divider, IOVisualCostants, VSpacer } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { StackActions } from "@react-navigation/native";
import I18n from "i18next";
import { ComponentProps, useEffect, useState } from "react";
import { FlatList } from "react-native";

import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import { servicePreferencePotByIdSelector } from "../../../services/details/store/selectors";
import { isServicePreferenceResponseSuccess } from "../../../services/details/types/ServicePreferenceResponse";
import { trackFciQtspTos, trackFciUxConversion } from "../../analytics";
import LinkedText from "../../components/LinkedText";
import LoadingComponent from "../../components/LoadingComponent";
import QtspClauseListItem from "../../components/QtspClauseListItem";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { useFciCheckService } from "../../hooks/useFciCheckService";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciStartSigningRequest } from "../../store/actions";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import { fciMetadataServiceIdSelector } from "../../store/reducers/fciMetadata";
import { fciPollFilledDocumentReadySelector } from "../../store/reducers/fciPollFilledDocument";
import {
  fciQtspClausesSelector,
  fciQtspPrivacyTextSelector,
  fciQtspPrivacyUrlSelector
} from "../../store/reducers/fciQtspClauses";
import { fciQtspErrorKindSelector } from "../../store/selectors/fciErrors";

const FciQtspClausesScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const [clausesChecked, setClausesChecked] = useState(0);
  const fciServiceId = useIOSelector(fciMetadataServiceIdSelector);
  const servicePreferencePot = useIOSelector(state =>
    servicePreferencePotByIdSelector(state, fciServiceId)
  );
  const qtspClausesSelector = useIOSelector(fciQtspClausesSelector);
  const qtspPrivacyTextSelector = useIOSelector(fciQtspPrivacyTextSelector);
  const qtspPrivacyUrlSelector = useIOSelector(fciQtspPrivacyUrlSelector);
  const isPollFilledDocumentReady = useIOSelector(
    fciPollFilledDocumentReadySelector
  );
  const qtspErrorKind = useIOSelector(fciQtspErrorKindSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);

  const servicePreferenceValue = pot.getOrElse(servicePreferencePot, undefined);

  const isServiceActive =
    servicePreferenceValue &&
    isServicePreferenceResponseSuccess(servicePreferenceValue) &&
    servicePreferenceValue.value.inbox;

  // tracks only when polling is finished
  useOnFirstRender(
    () => {
      trackFciQtspTos();
    },
    () => !qtspErrorKind && isPollFilledDocumentReady
  );

  useEffect(() => {
    if (fciServiceId) {
      dispatch(loadServicePreference.request(fciServiceId as ServiceId));
    }
  }, [dispatch, fciServiceId]);

  useEffect(() => {
    if (qtspErrorKind) {
      navigation.dispatch(StackActions.replace(FCI_ROUTES.QTSP_ERROR));
    }
  }, [qtspErrorKind, navigation]);

  const { present: showCheckService, bottomSheet: fciCheckService } =
    useFciCheckService();

  const { present: showAbort, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow({
      showDialogOnBack: false
    });

  const openUrl = (url: string) => {
    navigation.navigate(FCI_ROUTES.MAIN, {
      screen: FCI_ROUTES.DOC_PREVIEW,
      params: {
        documentUrl: url
      }
    });
  };

  useHeaderSecondLevel({
    title: "",
    supportRequest: true,
    contextualHelp: emptyContextualHelp,
    headerShown: isPollFilledDocumentReady
  });

  if (qtspErrorKind || !isPollFilledDocumentReady) {
    return <LoadingComponent testID={"FciLoadingScreenTestID"} />;
  }

  const renderClausesFields = () => (
    <FlatList
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={qtspClausesSelector}
      ItemSeparatorComponent={() => <Divider />}
      keyboardShouldPersistTaps={"handled"}
      keyExtractor={(_, index) => `${index}`}
      ListFooterComponent={
        <>
          <Divider />
          <VSpacer size={24} />
          <LinkedText
            onPress={openUrl}
            replacementUrl={qtspPrivacyUrlSelector}
            text={qtspPrivacyTextSelector}
          />
        </>
      }
      renderItem={({ item }) => (
        <QtspClauseListItem
          clause={item}
          onChange={value => {
            setClausesChecked(prev => (value ? prev + 1 : prev - 1));
          }}
          onLinkPress={openUrl}
        />
      )}
      scrollEnabled={false}
      testID={"FciQtspClausesListTestID"}
    />
  );

  const actions: ComponentProps<typeof IOScrollView>["actions"] = {
    type: "TwoButtons",
    primary: {
      disabled: clausesChecked !== qtspClausesSelector.length,
      label: I18n.t("global.buttons.continue"),
      onPress: () => {
        if (isServiceActive) {
          trackFciUxConversion(fciEnvironment);
          dispatch(fciStartSigningRequest());
        } else {
          showCheckService();
        }
      }
    },
    secondary: {
      onPress: showAbort,
      label: I18n.t("global.buttons.cancel")
    }
  };

  return (
    <IOScrollViewWithLargeHeader
      actions={actions}
      contextualHelp={emptyContextualHelp}
      description={I18n.t("features.fci.qtspTos.subTitle")}
      headerActionsProp={{ showHelp: true }}
      testID={"FciQtspClausesTestID"}
      title={{
        label: I18n.t("features.fci.qtspTos.title")
      }}
    >
      {renderClausesFields()}
      {fciAbortSignature}
      {fciCheckService}
    </IOScrollViewWithLargeHeader>
  );
};
export default FciQtspClausesScreen;
