import * as React from "react";
import { View, SectionList, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { StackActions, useNavigation } from "@react-navigation/native";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { constFalse, increment, pipe } from "fp-ts/lib/function";
import {
  ButtonSolidProps,
  FooterWithButtons,
  H2,
  H4,
  IconButton,
  IOColors,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import { FCI_ROUTES } from "../../navigation/routes";
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
import { LightModalContext } from "../../../../components/ui/LightModal";
import DocumentWithSignature from "../../components/DocumentWithSignature";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import {
  trackFciShowSignatureFields,
  trackFciStartSignature
} from "../../analytics";
import { useFciSignatureFieldInfo } from "../../hooks/useFciSignatureFieldInfo";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

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
  const fciEnvironment = useSelector(fciEnvironmentSelector);
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

  const { present: presentInfo, bottomSheet: fciSignaturefieldInfo } =
    useFciSignatureFieldInfo();

  const onPressDetail = (signatureField: SignatureField) => {
    trackFciShowSignatureFields(fciEnvironment);
    showModal(
      <DocumentWithSignature
        attrs={signatureField.attrs}
        currentDoc={currentDoc}
        onClose={hideModal}
        onError={() => onError()}
        testID={"FciDocumentWithSignatureTestID"}
      />
    );
  };

  /**
   * Callback which sets the isError state to true and hides the modal.
   */
  const onError = () => {
    setIsError(true);
    hideModal();
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

  const renderSectionHeader = (info: { section: { title: string } }) => {
    const clauseLabel = getClauseLabel(info.section.title as Clause["type"]);
    return (
      <View
        style={{
          backgroundColor: IOColors.white,
          flexDirection: "row"
        }}
      >
        <H4 color="bluegrey" style={IOStyles.flex}>
          {clauseLabel}
        </H4>

        {/* 
          Show info icon and signature field info only for unfair clauses
          NOTE: this could be a temporary solution, since we could have
          an improved user experience.
        */}
        {info.section.title === ClausesTypeEnum.UNFAIR && (
          <>
            <IconButton
              icon={"info"}
              onPress={presentInfo}
              accessibilityLabel={I18n.t("global.buttons.info")}
            />
            {fciSignaturefieldInfo}
          </>
        )}
      </View>
    );
  };

  const renderSignatureFields = () => (
    <SectionList
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

  const cancelButtonProps: ButtonSolidProps = {
    onPress: present,
    label: I18n.t("global.buttons.cancel"),
    accessibilityLabel: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps: ButtonSolidProps = {
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
        trackFciStartSignature(fciEnvironment);
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.USER_DATA_SHARE
        });
      }
    },
    accessibilityLabel:
      currentDoc < documentsSelector.length - 1
        ? I18n.t("global.buttons.continue")
        : "Firma",
    label:
      currentDoc < documentsSelector.length - 1
        ? I18n.t("global.buttons.continue")
        : "Firma"
  };

  useHeaderSecondLevel({
    title: I18n.t("features.fci.title"),
    supportRequest: true,
    contextualHelp: emptyContextualHelp
  });

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
    <>
      <SafeAreaView
        style={IOStyles.flex}
        testID={"FciSignatureFieldsTestID"}
        edges={["bottom", "left", "right"]}
      >
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H2>{I18n.t("features.fci.signatureFields.title")}</H2>
          <VSpacer size={32} />
          {renderSignatureFields()}
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          secondary={{ type: "Solid", buttonProps: continueButtonProps }}
          primary={{ type: "Outline", buttonProps: cancelButtonProps }}
        />
      </SafeAreaView>
      {fciAbortSignature}
    </>
  );
};
export default FciSignatureFieldsScreen;
