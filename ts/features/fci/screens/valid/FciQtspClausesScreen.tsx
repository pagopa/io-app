import * as React from "react";
import { SafeAreaView, FlatList, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { constNull } from "fp-ts/lib/function";
import { useNavigation } from "@react-navigation/native";
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
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";

const styles = StyleSheet.create({
  paddingText: {
    paddingLeft: 4
  }
});
const FciQtspClausesScreen = () => {
  const [isClausesChecked, setIsClausesChecked] = React.useState(0);
  const qtspClausesSelector = useSelector(fciQtspClausesSelector);
  const qtspPrivacyTextSelector = useSelector(fciQtspPrivacyTextSelector);
  const qtspPrivacyUrlSelector = useSelector(fciQtspPrivacyUrlSelector);
  const navigation = useNavigation();

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const openUrl = (url: string) => {
    navigation.navigate(FCI_ROUTES.DOC_PREVIEW, { documentUrl: url });
  };

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
                  ? setIsClausesChecked(isClausesChecked + 1)
                  : setIsClausesChecked(isClausesChecked - 1)
              }
              onLinkPress={openUrl}
            />
          )}
          ListFooterComponent={
            <H4>
              <H4 color={"bluegreyDark"} weight={"Regular"}>
                {qtspPrivacyTextSelector}
              </H4>
              <View style={styles.paddingText} />
              <Link
                testID="FciQtspClausesPrivacyUrlTestID"
                onPress={() => openUrl(qtspPrivacyUrlSelector)}
              >
                {I18n.t("features.fci.qtspTos.show")}
              </Link>
            </H4>
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
    disabled: isClausesChecked !== qtspClausesSelector.length,
    onPress: constNull,
    title: I18n.t("global.buttons.continue")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.fci.signatureFields.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView
        style={[IOStyles.flex, IOStyles.horizontalContentPadding]}
        testID={"FciQtspClausesTestID"}
      >
        <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("features.fci.qtspTos.title")}</H1>
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
