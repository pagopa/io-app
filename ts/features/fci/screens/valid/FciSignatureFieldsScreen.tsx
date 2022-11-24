import * as React from "react";
import { View } from "native-base";
import { SafeAreaView, SectionList } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import * as A from "fp-ts/lib/Array";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as B from "fp-ts/lib/boolean";
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
import { DocumentSignature } from "../../../../../definitions/fci/DocumentSignature";
import {
  clausesByType,
  clauseTypeMaping,
  getSectionListData
} from "../../utils/signatureFields";

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

  // get signatureFields for the current document
  const docSignatures = pipe(
    documentsSignaturesSelector,
    RA.findFirst(doc => doc.document_id === docId)
  );

  React.useEffect(() => {
    // get required signatureFields for the current document
    // that user should check to sign the document
    const requiredFields = clausesByType(
      signatureFieldsSelector,
      ClausesTypeEnum.REQUIRED
    );

    // get required signatureFields for the current document
    // that user has already checked to sign the document
    const res = pipe(
      requiredFields,
      RA.map(signatureField =>
        pipe(
          docSignatures,
          RA.fromOption,
          RA.map(doc => doc.signature_fields),
          RA.map(fields => fields.filter(f => f === signatureField)),
          RA.flatten
        )
      ),
      RA.flatten
    );

    setIsClausesChecked(res.length >= requiredFields.length);
  }, [
    documentsSignaturesSelector,
    docId,
    signatureFieldsSelector,
    docSignatures
  ]);

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

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

  const updateDocumentSignatures = (fn: (doc: DocumentSignature) => void) =>
    pipe(
      docSignatures,
      O.chain(document => O.fromNullable(document)),
      O.map(doc => fn(doc))
    );

  const onChange = (value: boolean, item: SignatureField) =>
    pipe(
      value,
      O.of,
      O.map(
        B.match(
          () =>
            updateDocumentSignatures(doc =>
              dispatch(
                fciUpdateDocumentSignaturesRequest({
                  ...doc,
                  signature_fields: [
                    ...doc.signature_fields.filter(f => f !== item)
                  ]
                })
              )
            ),
          () =>
            updateDocumentSignatures(doc =>
              dispatch(
                fciUpdateDocumentSignaturesRequest({
                  ...doc,
                  signature_fields: [...doc.signature_fields, item]
                })
              )
            )
        )
      )
    );

  const renderSignatureFields = () => (
    <SectionList
      style={IOStyles.horizontalContentPadding}
      sections={getSectionListData(signatureFieldsSelector)}
      keyExtractor={(item, index) => `${item.clause.title}${index}`}
      testID={"FciSignatureFieldsSectionListTestID"}
      renderItem={({ item }) => (
        <SignatureFieldItem
          title={item.clause.title}
          value={O.isSome(
            pipe(
              documentsSignaturesSelector,
              RA.findFirst(doc => doc.document_id === docId),
              O.chain(document => O.fromNullable(document)),
              O.map(doc => doc.signature_fields),
              O.map(fields => A.isNonEmpty(fields.filter(f => f === item))),
              O.chain(isNonEmpty => (isNonEmpty ? O.some(true) : O.none))
            )
          )}
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
      <SafeAreaView style={IOStyles.flex} testID={"FciSignatureFieldsTestID"}>
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
