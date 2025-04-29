import {
  Body,
  Divider,
  FooterActionsInline,
  H2,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useState, useEffect, ComponentProps } from "react";
import { FlatList, ScrollView, View } from "react-native";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { loadServicePreference } from "../../../services/details/store/actions/preference";
import { servicePreferencePotSelector } from "../../../services/details/store/reducers";
import { isServicePreferenceResponseSuccess } from "../../../services/details/types/ServicePreferenceResponse";
import { trackFciUxConversion } from "../../analytics";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import LinkedText from "../../components/LinkedText";
import LoadingComponent from "../../components/LoadingComponent";
import QtspClauseListItem from "../../components/QtspClauseListItem";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { useFciCheckService } from "../../hooks/useFciCheckService";
import { FCI_ROUTES } from "../../navigation/routes";
import { fciEndRequest, fciStartSigningRequest } from "../../store/actions";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import { fciMetadataServiceIdSelector } from "../../store/reducers/fciMetadata";
import {
  fciPollFilledDocumentErrorSelector,
  fciPollFilledDocumentReadySelector
} from "../../store/reducers/fciPollFilledDocument";
import {
  fciQtspClausesSelector,
  fciQtspPrivacyTextSelector,
  fciQtspPrivacyUrlSelector
} from "../../store/reducers/fciQtspClauses";

const FciQtspClausesScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const [clausesChecked, setClausesChecked] = useState(0);
  const servicePreferencePot = useIOSelector(servicePreferencePotSelector);
  const qtspClausesSelector = useIOSelector(fciQtspClausesSelector);
  const qtspPrivacyTextSelector = useIOSelector(fciQtspPrivacyTextSelector);
  const qtspPrivacyUrlSelector = useIOSelector(fciQtspPrivacyUrlSelector);
  const isPollFilledDocumentReady = useIOSelector(
    fciPollFilledDocumentReadySelector
  );
  const fciPollFilledDocumentError = useIOSelector(
    fciPollFilledDocumentErrorSelector
  );
  const fciServiceId = useIOSelector(fciMetadataServiceIdSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);

  const servicePreferenceValue = pot.getOrElse(servicePreferencePot, undefined);

  const isServiceActive =
    servicePreferenceValue &&
    isServicePreferenceResponseSuccess(servicePreferenceValue) &&
    servicePreferenceValue.value.inbox;

  useEffect(() => {
    if (fciServiceId) {
      dispatch(loadServicePreference.request(fciServiceId as ServiceId));
    }
  }, [dispatch, fciServiceId]);

  const { present: showCheckService, bottomSheet: fciCheckService } =
    useFciCheckService();

  const { present: showAbort, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const openUrl = (url: string) => {
    navigation.navigate(FCI_ROUTES.MAIN, {
      screen: FCI_ROUTES.DOC_PREVIEW,
      params: {
        documentUrl: url
      }
    });
  };

  useHeaderSecondLevel({
    title: I18n.t("features.fci.title"),
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  if (fciPollFilledDocumentError && !isPollFilledDocumentReady) {
    return (
      <GenericErrorComponent
        title={I18n.t("features.fci.errors.generic.default.title")}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        assistance={true}
        testID="PollingErrorComponentTestID"
      />
    );
  } else if (!isPollFilledDocumentReady) {
    return <LoadingComponent testID={"FciLoadingScreenTestID"} />;
  }

  const renderClausesFields = () => (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          paddingBottom: IOVisualCostants.appMarginDefault
        }}
      >
        <FlatList
          data={qtspClausesSelector}
          keyExtractor={(_, index) => `${index}`}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <QtspClauseListItem
              clause={item}
              onChange={value =>
                value
                  ? setClausesChecked(clausesChecked + 1)
                  : setClausesChecked(clausesChecked - 1)
              }
              onLinkPress={openUrl}
            />
          )}
          ListFooterComponent={
            <>
              <Divider />
              <VSpacer size={24} />
              <LinkedText
                text={qtspPrivacyTextSelector}
                replacementUrl={qtspPrivacyUrlSelector}
                onPress={openUrl}
              />
            </>
          }
          keyboardShouldPersistTaps={"handled"}
          testID={"FciQtspClausesListTestID"}
        />
      </View>
    </View>
  );

  const cancelButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["startAction"] = {
    color: "primary",
    onPress: showAbort,
    label: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["endAction"] = {
    color: "primary",
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
  };

  return (
    <>
      <View style={{ flex: 1 }} testID={"FciQtspClausesTestID"}>
        {/* TODO: Replace with `IOScrollView` and `FooterActions` component. */}
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: IOVisualCostants.appMarginDefault
          }}
        >
          <H2>{I18n.t("features.fci.qtspTos.title")}</H2>
          <VSpacer size={16} />
          <Body>{I18n.t("features.fci.qtspTos.subTitle")}</Body>
          {renderClausesFields()}
        </ScrollView>
        <FooterActionsInline
          startAction={cancelButtonProps}
          endAction={continueButtonProps}
        />
      </View>
      {fciAbortSignature}
      {fciCheckService}
    </>
  );
};
export default FciQtspClausesScreen;
