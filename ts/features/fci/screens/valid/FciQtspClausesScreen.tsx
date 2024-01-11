import * as React from "react";
import { SafeAreaView, FlatList, View, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Body,
  ButtonSolidProps,
  Divider,
  FooterWithButtons,
  H2,
  HeaderSecondLevel,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  fciQtspClausesSelector,
  fciQtspPrivacyTextSelector,
  fciQtspPrivacyUrlSelector
} from "../../store/reducers/fciQtspClauses";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import customVariables from "../../../../theme/variables";
import QtspClauseListItem from "../../components/QtspClauseListItem";
import { FCI_ROUTES } from "../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { fciEndRequest, fciStartSigningRequest } from "../../store/actions";
import {
  fciPollFilledDocumentErrorSelector,
  fciPollFilledDocumentReadySelector
} from "../../store/reducers/fciPollFilledDocument";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import LinkedText from "../../components/LinkedText";
import { servicePreferenceSelector } from "../../../../store/reducers/entities/services/servicePreference";
import { loadServicePreference } from "../../../../store/actions/services/servicePreference";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useFciCheckService } from "../../hooks/useFciCheckService";
import { isServicePreferenceResponseSuccess } from "../../../../types/services/ServicePreferenceResponse";
import { fciMetadataServiceIdSelector } from "../../store/reducers/fciMetadata";
import { trackFciUxConversion } from "../../analytics";
import LoadingComponent from "../../components/LoadingComponent";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";

const FciQtspClausesScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const [clausesChecked, setClausesChecked] = React.useState(0);
  const servicePreference = useSelector(servicePreferenceSelector);
  const qtspClausesSelector = useSelector(fciQtspClausesSelector);
  const qtspPrivacyTextSelector = useSelector(fciQtspPrivacyTextSelector);
  const qtspPrivacyUrlSelector = useSelector(fciQtspPrivacyUrlSelector);
  const isPollFilledDocumentReady = useSelector(
    fciPollFilledDocumentReadySelector
  );
  const fciPollFilledDocumentError = useSelector(
    fciPollFilledDocumentErrorSelector
  );
  const fciServiceId = useSelector(fciMetadataServiceIdSelector);
  const fciEnvironment = useSelector(fciEnvironmentSelector);

  const servicePreferenceValue = pot.getOrElse(servicePreference, undefined);

  const isServiceActive =
    servicePreferenceValue &&
    isServicePreferenceResponseSuccess(servicePreferenceValue) &&
    servicePreferenceValue.value.inbox;

  React.useEffect(() => {
    if (fciServiceId) {
      dispatch(loadServicePreference.request(fciServiceId as ServiceId));
    }
  }, [dispatch, fciServiceId]);

  const { present: showCheckService, bottomSheet: fciCheckService } =
    useFciCheckService();

  const { present: showAbort, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const openUrl = (url: string) => {
    navigation.navigate(FCI_ROUTES.DOC_PREVIEW, {
      documentUrl: url,
      enableAnnotationRendering: true
    });
  };

  const startSupportRequest = useStartSupportRequest({
    contextualHelp: emptyContextualHelp
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          goBack={navigation.goBack}
          title={I18n.t("features.fci.signatureFields.title")}
          type={"singleAction"}
          backAccessibilityLabel={I18n.t("global.buttons.back")}
          firstAction={{
            icon: "help",
            onPress: startSupportRequest,
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.open.label"
            )
          }}
        />
      )
    });
  }, [navigation, startSupportRequest]);

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
        style={[
          IOStyles.flex,
          { paddingBottom: customVariables.contentPadding }
        ]}
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

  const cancelButtonProps: ButtonSolidProps = {
    onPress: showAbort,
    label: I18n.t("global.buttons.cancel"),
    accessibilityLabel: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps: ButtonSolidProps = {
    disabled: clausesChecked !== qtspClausesSelector.length,
    onPress: () => {
      if (isServiceActive) {
        trackFciUxConversion(fciEnvironment);
        dispatch(fciStartSigningRequest());
      } else {
        showCheckService();
      }
    },
    label: I18n.t("global.buttons.continue"),
    accessibilityLabel: I18n.t("global.buttons.continue")
  };

  return (
    <>
      <SafeAreaView style={IOStyles.flex} testID={"FciQtspClausesTestID"}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H2>{I18n.t("features.fci.qtspTos.title")}</H2>
          <VSpacer size={16} />
          <Body>{I18n.t("features.fci.qtspTos.subTitle")}</Body>
          {renderClausesFields()}
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          primary={{ type: "Outline", buttonProps: cancelButtonProps }}
          secondary={{ type: "Solid", buttonProps: continueButtonProps }}
        />
      </SafeAreaView>
      {fciAbortSignature}
      {fciCheckService}
    </>
  );
};
export default FciQtspClausesScreen;
