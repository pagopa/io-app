import * as React from "react";
import { View } from "native-base";
import { SafeAreaView, SectionList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/string";
import { constNull, pipe } from "fp-ts/lib/function";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOSelector } from "../../../../store/hooks";
import { fciDocumentSignatureFieldsFieldsSelector } from "../../store/reducers/fciSignatureRequest";
import { Document } from "../../../../../definitions/fci/Document";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { FciParamsList } from "../../navigation/params";
import SignatureFieldItem from "../../components/SignatureFieldItem";
import { H3 } from "../../../../components/core/typography/H3";
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { FCI_ROUTES } from "../../navigation/routes";

export type FciSignatureFieldsScreenNavigationParams = Readonly<{
  documentId: Document["id"];
  currentDoc: number;
}>;

const FciSignatureFieldsScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_SIGNATURE_FIELDS">
) => {
  const signatureFieldsSelector = useIOSelector(
    fciDocumentSignatureFieldsFieldsSelector(props.route.params.documentId)
  );
  const navigation = useNavigation();

  type DATA_TYPE = {
    title: string;
    data: ReadonlyArray<SignatureField>;
  };

  const clausesByType = (clauseType: string) =>
    pipe(
      signatureFieldsSelector,
      RA.filterMap(signatureField =>
        clauseType === signatureField.clause.type
          ? O.fromNullable(signatureField)
          : O.none
      )
    );

  const getAllTypes = pipe(
    signatureFieldsSelector,
    RA.filterMap(signatureField => O.fromNullable(signatureField.clause.type)),
    RA.uniq(S.Eq)
  );

  const DATA: ReadonlyArray<DATA_TYPE> = pipe(
    getAllTypes,
    RA.map(type => ({
      title: type,
      data: clausesByType(type)
    }))
  );

  enum ClauseTypeMappingEnum {
    "REQUIRED" = "FIRME OBBLIGATORIE",
    "UNFAIR" = "FIRME CLAUSOLE VESSATORIE",
    "OPTIONAL" = "FIRME FACOLTATIVE",
    "UNDEFINED" = "FIRMA NON DEFINITA"
  }

  const clauseTypeMaping: Map<string, ClauseTypeMappingEnum> = new Map<
    string,
    ClauseTypeMappingEnum
  >([
    ["REQUIRED", ClauseTypeMappingEnum.REQUIRED],
    ["UNFAIR", ClauseTypeMappingEnum.UNFAIR],
    ["OPTIONAL", ClauseTypeMappingEnum.OPTIONAL]
  ]);

  const onPressDetail = (signatureField: SignatureField) => {
    navigation.navigate(FCI_ROUTES.MAIN, {
      screen: FCI_ROUTES.DOCUMENTS,
      params: {
        attrs: signatureField.attrs,
        currentDoc: props.route.params.currentDoc
      },
      merge: true
    });
  };

  const renderSignatureFields = () => (
    <SectionList
      style={IOStyles.horizontalContentPadding}
      sections={DATA}
      keyExtractor={(item, index) => `${item.clause.title}${index}`}
      renderItem={({ item }) => (
        <SignatureFieldItem
          title={item.clause.title}
          onChange={constNull}
          onPressDetail={() => onPressDetail(item)}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <H3>{clauseTypeMaping.get(title)}</H3>
      )}
    />
  );

  const cancelButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: constNull,
    title: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: constNull,
    title: I18n.t("global.buttons.continue")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.fci.signatureFields.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <View
          style={[IOStyles.horizontalContentPadding, { paddingBottom: 56 }]}
        >
          <H1>{I18n.t("features.fci.signatureFields.title")}</H1>
        </View>
        {renderSignatureFields()}
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default FciSignatureFieldsScreen;
