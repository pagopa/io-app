import {
  Body,
  ButtonSolidProps,
  Divider,
  FooterWithButtons,
  H2,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { FlatList, ScrollView, View } from "react-native";
import { useSelector } from "react-redux";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { loadServicePreference } from "../../../../store/actions/services/servicePreference";
import { useIODispatch } from "../../../../store/hooks";
import { servicePreferenceSelector } from "../../../../store/reducers/entities/services/servicePreference";
import customVariables from "../../../../theme/variables";
import { isServicePreferenceResponseSuccess } from "../../../../types/services/ServicePreferenceResponse";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
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
    navigation.navigate(FCI_ROUTES.MAIN, {
      screen: FCI_ROUTES.DOC_PREVIEW,
      params: {
        documentUrl: url,
        enableAnnotationRendering: true
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
      <View style={IOStyles.flex} testID={"FciQtspClausesTestID"}>
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
      </View>
      {fciAbortSignature}
      {fciCheckService}
    </>
  );
};
export default FciQtspClausesScreen;
