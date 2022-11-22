import * as React from "react";
import { View } from "native-base";
import { SafeAreaView, SectionList } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import { increment, pipe } from "fp-ts/lib/function";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIODispatch } from "../../../../store/hooks";
import {
  fciDocumentSignatureFieldsFieldsSelector,
  fciSignatureDetailDocumentsSelector
} from "../../store/reducers/fciSignatureRequest";
import { Document } from "../../../../../definitions/fci/Document";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { FciParamsList } from "../../navigation/params";
import SignatureFieldItem from "../../components/SignatureFieldItem";
import { H3 } from "../../../../components/core/typography/H3";
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { FCI_ROUTES } from "../../navigation/routes";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { IOColors } from "../../../../components/core/variables/IOColors";
import IconFont from "../../../../components/ui/IconFont";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { fciUpdateDocumentSignaturesRequest } from "../../store/actions";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { ClausesTypeEnum } from "../../../../../definitions/fci/ClausesType";

export type FciSignatureFieldsScreenNavigationParams = Readonly<{
  documentId: Document["id"];
  currentDoc: number;
}>;

const FciSignatureFieldsScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_SIGNATURE_FIELDS">
) => {
  const docId = props.route.params.documentId;
  const currentDoc = props.route.params.currentDoc;
  const documentsSelector = useSelector(fciSignatureDetailDocumentsSelector);
  const signatureFieldsSelector = useSelector(
    fciDocumentSignatureFieldsFieldsSelector(docId)
  );
  const documentsSignaturesSelector = useSelector(
    fciDocumentSignaturesSelector
  );
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const [isClausesChecked, setIsClausesChecked] = React.useState(false);

  React.useEffect(() => {
    const docSignatures = documentsSignaturesSelector.documentSignatures.find(
      d => d.document_id === docId
    );

    const requiredFields = signatureFieldsSelector.filter(
      signatureField => signatureField.clause.type === ClausesTypeEnum.REQUIRED
    );

    const res = requiredFields
      .map(signatureField =>
        docSignatures?.signature_fields.filter(f => f === signatureField)
      )
      .flat();

    setIsClausesChecked(res.length >= requiredFields.length);
  }, [
    documentsSignaturesSelector.documentSignatures,
    docId,
    signatureFieldsSelector
  ]);

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

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
        currentDoc
      },
      merge: true
    });
  };

  const onChange = (value: boolean, item: SignatureField) => {
    // TODO: refactor this logic to use fp-ts
    const docSignatures = documentsSignaturesSelector.documentSignatures.find(
      d => d.document_id === docId
    );
    if (docSignatures && value) {
      dispatch(
        fciUpdateDocumentSignaturesRequest({
          ...docSignatures,
          signature_fields: [...docSignatures.signature_fields, item]
        })
      );
    } else if (docSignatures) {
      dispatch(
        fciUpdateDocumentSignaturesRequest({
          ...docSignatures,
          signature_fields: [
            ...docSignatures.signature_fields.filter(f => f !== item)
          ]
        })
      );
    }
  };

  const renderSignatureFields = () => (
    <SectionList
      style={IOStyles.horizontalContentPadding}
      sections={DATA}
      keyExtractor={(item, index) => `${item.clause.title}${index}`}
      renderItem={({ item }) => (
        <SignatureFieldItem
          title={item.clause.title}
          value={
            // TODO: refactor this logic to use fp-ts
            documentsSignaturesSelector.documentSignatures
              .find(d => d.document_id === docId)
              ?.signature_fields.find(f => f === item)
              ? true
              : false
          }
          onChange={v => onChange(v, item)}
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
    onPress: present,
    title: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    disabled: !isClausesChecked,
    onPress: () => {
      if (currentDoc < documentsSelector.length - 1) {
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.DOCUMENTS,
          params: {
            attrs: undefined,
            currentDoc: increment(currentDoc)
          }
        });
      }
    },
    title:
      currentDoc < documentsSelector.length - 1
        ? I18n.t("global.buttons.continue")
        : "Firma"
  };

  const customGoBack: React.ReactElement = (
    <TouchableDefaultOpacity
      onPress={() =>
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.DOCUMENTS,
          params: {
            attrs: undefined,
            currentDoc: undefined
          },
          merge: true
        })
      }
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont name={"io-back"} style={{ color: IOColors.bluegrey }} />
    </TouchableDefaultOpacity>
  );

  return (
    <BaseScreenComponent
      goBack={true}
      customGoBack={customGoBack}
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
      {fciAbortSignature}
    </BaseScreenComponent>
  );
};
export default FciSignatureFieldsScreen;
