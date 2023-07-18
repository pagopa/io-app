import * as React from "react";
import { SafeAreaView, FlatList, View } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { constNull } from "fp-ts/lib/function";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  fciQtspClausesSelector,
  fciQtspPrivacyTextSelector,
  fciQtspPrivacyUrlSelector
} from "../../store/reducers/fciQtspClauses";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import customVariables from "../../../../theme/variables";
import QtspClauseListItem from "../../components/QtspClauseListItem";
import { FCI_ROUTES } from "../../navigation/routes";
import { useIODispatch } from "../../../../store/hooks";
import { fciEndRequest, fciStartSigningRequest } from "../../store/actions";
import { LoadingErrorComponent } from "../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  fciPollFilledDocumentErrorSelector,
  fciPollFilledDocumentReadySelector
} from "../../store/reducers/fciPollFilledDocument";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import LinkedText from "../../components/LinkedText";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { servicePreferenceSelector } from "../../../../store/reducers/entities/services/servicePreference";
import { loadServicePreference } from "../../../../store/actions/services/servicePreference";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { useFciCheckService } from "../../hooks/useFciCheckService";
import { isServicePreferenceResponseSuccess } from "../../../../types/services/ServicePreferenceResponse";
import { fciMetadataServiceIdSelector } from "../../store/reducers/fciMetadata";
import ScreenContent from "../../../../components/screens/ScreenContent";
import { trackFciUxConversion } from "../../analytics";

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

  const LoadingComponent = () => (
    <LoadingErrorComponent
      isLoading={true}
      loadingCaption={""}
      onRetry={constNull}
      testID={"FciLoadingScreenTestID"}
    />
  );

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
    return <LoadingComponent />;
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
          ItemSeparatorComponent={() => (
            <ItemSeparatorComponent noPadded={true} />
          )}
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
              <ItemSeparatorComponent noPadded={true} />
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

  const cancelButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: showAbort,
    title: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    disabled: clausesChecked !== qtspClausesSelector.length,
    onPress: () => {
      if (isServiceActive) {
        trackFciUxConversion();
        dispatch(fciStartSigningRequest());
      } else {
        showCheckService();
      }
    },
    title: I18n.t("global.buttons.continue")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.fci.signatureFields.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"FciQtspClausesTestID"}>
        <ScreenContent
          title={I18n.t("features.fci.qtspTos.title")}
          subtitle={I18n.t("features.fci.qtspTos.subTitle")}
        >
          <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
            {renderClausesFields()}
          </View>
        </ScreenContent>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
      {fciAbortSignature}
      {fciCheckService}
    </BaseScreenComponent>
  );
};
export default FciQtspClausesScreen;
