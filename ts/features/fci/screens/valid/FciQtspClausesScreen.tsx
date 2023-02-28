import * as React from "react";
import { SafeAreaView, FlatList, View } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import { H1 } from "../../../../components/core/typography/H1";
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
import { H4 } from "../../../../components/core/typography/H4";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

const FciQtspClausesScreen = () => {
  const [clausesChecked, setClausesChecked] = React.useState(0);
  const qtspClausesSelector = useSelector(fciQtspClausesSelector);
  const qtspPrivacyTextSelector = useSelector(fciQtspPrivacyTextSelector);
  const qtspPrivacyUrlSelector = useSelector(fciQtspPrivacyUrlSelector);
  const isPollFilledDocumentReady = useSelector(
    fciPollFilledDocumentReadySelector
  );
  const fciPollFilledDocumentError = useSelector(
    fciPollFilledDocumentErrorSelector
  );

  const navigation = useNavigation();
  const dispatch = useIODispatch();

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const openUrl = (url: string) => {
    navigation.navigate(FCI_ROUTES.DOC_PREVIEW, { documentUrl: url });
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
    return <GenericErrorComponent onPress={() => dispatch(fciEndRequest())} />;
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
    onPress: present,
    title: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    disabled: clausesChecked !== qtspClausesSelector.length,
    onPress: () => dispatch(fciStartSigningRequest()),
    title: I18n.t("global.buttons.continue")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.fci.signatureFields.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"FciQtspClausesTestID"}>
        <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("features.fci.qtspTos.title")}</H1>
          <VSpacer size={8} />
          <H4 weight="Regular" color={"bluegreyDark"}>
            {I18n.t("features.fci.qtspTos.subTitle")}
          </H4>
          {renderClausesFields()}
        </View>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
      {fciAbortSignature}
    </BaseScreenComponent>
  );
};
export default FciQtspClausesScreen;
