import * as React from "react";
import { View, SafeAreaView, SectionList, Platform } from "react-native";
import { useSelector } from "react-redux";
import { StackActions, useNavigation } from "@react-navigation/native";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { constFalse, increment, pipe } from "fp-ts/lib/function";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIODispatch } from "../../../../store/hooks";
import {
  fciDocumentSignatureFieldsSelector,
  fciSignatureDetailDocumentsSelector
} from "../../store/reducers/fciSignatureRequest";
import { DocumentDetailView } from "../../../../../definitions/fci/DocumentDetailView";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { FciParamsList } from "../../navigation/params";
import SignatureFieldItem from "../../components/SignatureFieldItem";
import { H3 } from "../../../../components/core/typography/H3";
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { FCI_ROUTES } from "../../navigation/routes";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import {
  fciEndRequest,
  fciUpdateDocumentSignaturesRequest
} from "../../store/actions";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import {
  Clause,
  TypeEnum as ClausesTypeEnum
} from "../../../../../definitions/fci/Clause";
import { DocumentToSign } from "../../../../../definitions/fci/DocumentToSign";
import {
  getClauseLabel,
  getRequiredSignatureFields,
  getSectionListData,
  orderSignatureFields
} from "../../utils/signatureFields";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import ScreenContent from "../../../../components/screens/ScreenContent";
import { LightModalContext } from "../../../../components/ui/LightModal";
import DocumentWithSignature from "../../components/DocumentWithSignature";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import {
  trackFciShowSignatureFields,
  trackFciStartSignature
} from "../../analytics";
import IconButton from "../../../../components/ui/IconButton";

export type FciSignatureFieldsScreenNavigationParams = Readonly<{
  documentId: DocumentDetailView["id"];
  currentDoc: number;
}>;

const FciSignatureFieldsScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_SIGNATURE_FIELDS">
) => {
  const currentDoc = props.route.params.currentDoc;
  const docId = props.route.params.documentId;
  const documentsSelector = useSelector(fciSignatureDetailDocumentsSelector);
  const signatureFieldsSelector = useSelector(
    fciDocumentSignatureFieldsSelector(docId)
  );
  const documentsSignaturesSelector = useSelector(
    fciDocumentSignaturesSelector
  );
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const [isClausesChecked, setIsClausesChecked] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const { showModal, hideModal } = React.useContext(LightModalContext);

  // get signatureFields for the current document
  const docSignatures = pipe(
    documentsSignaturesSelector,
    RA.findFirst(doc => doc.document_id === docId)
  );

  React.useEffect(() => {
    // get required signatureFields for the current document
    // that user should check to sign the document
    const requiredFields = getRequiredSignatureFields(signatureFieldsSelector);

    // get the required signature fields for the current document,
    // which the user has previously checked to sign it
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
    trackFciShowSignatureFields();
    showModal(
      <DocumentWithSignature
        attrs={signatureField.attrs}
        currentDoc={currentDoc}
        onClose={hideModal}
        onError={() => setIsError(true)}
        testID={"FciDocumentWithSignatureTestID"}
      />
    );
  };

  const updateDocumentSignatures = (fn: (doc: DocumentToSign) => void) =>
    pipe(
      docSignatures,
      O.chain(document => O.fromNullable(document)),
      O.map(fn)
    );

  const onChange = (value: boolean, item: SignatureField) =>
    updateDocumentSignatures(doc =>
      dispatch(
        fciUpdateDocumentSignaturesRequest({
          ...doc,
          signature_fields: !value
            ? [...doc.signature_fields.filter(f => f !== item)]
            : [...doc.signature_fields, item]
        })
      )
    );

  const renderSectionHeader = (info: {
    section: { title: string };
  }): React.ReactNode => (
    <View
      style={{
        backgroundColor: IOColors.white,
        flexDirection: "row"
      }}
    >
      <H3 color="bluegrey">
        {getClauseLabel(info.section.title as Clause["type"])}
      </H3>
    </View>
  );

  const renderSignatureFields = () => (
    <SectionList
      style={IOStyles.horizontalContentPadding}
      sections={getSectionListData(
        orderSignatureFields(signatureFieldsSelector)
      )}
      keyExtractor={(item, index) => `${item.clause.title}${index}`}
      testID={"FciSignatureFieldsSectionListTestID"}
      renderItem={({ item }) => (
        <SignatureFieldItem
          title={item.clause.title}
          disabled={item.clause.type === ClausesTypeEnum.REQUIRED}
          value={pipe(
            documentsSignaturesSelector,
            RA.findFirst(doc => doc.document_id === docId),
            O.chain(document => O.fromNullable(document)),
            O.map(doc => doc.signature_fields),
            O.map(RA.filter(f => f === item)),
            O.fold(constFalse, RA.isNonEmpty)
          )}
          onChange={v => onChange(v, item)}
          onPressDetail={() => onPressDetail(item)}
        />
      )}
      renderSectionHeader={renderSectionHeader}
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
        navigation.dispatch(
          StackActions.push(FCI_ROUTES.DOCUMENTS, {
            attrs: undefined,
            currentDoc: increment(currentDoc)
          })
        );
      } else {
        trackFciStartSignature();
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.USER_DATA_SHARE
        });
      }
    },
    title:
      currentDoc < documentsSelector.length - 1
        ? I18n.t("global.buttons.continue")
        : "Firma"
  };

  const customGoBack: React.ReactElement = (
    <IconButton
      icon={Platform.OS === "ios" ? "backiOS" : "backAndroid"}
      color={"neutral"}
      onPress={navigation.goBack}
      accessibilityLabel={I18n.t("global.buttons.back")}
    />
  );

  if (isError) {
    return (
      <GenericErrorComponent
        title={I18n.t("features.fci.errors.generic.default.title")}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        onPress={() => dispatch(fciEndRequest())}
        testID={"FciGenericErrorTestID"}
      />
    );
  }

  return (
    <BaseScreenComponent
      goBack={true}
      customGoBack={customGoBack}
      headerTitle={I18n.t("features.fci.signatureFields.title")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"FciSignatureFieldsTestID"}>
        <ScreenContent title={I18n.t("features.fci.signatureFields.title")}>
          <VSpacer size={32} />
          {renderSignatureFields()}
        </ScreenContent>
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
