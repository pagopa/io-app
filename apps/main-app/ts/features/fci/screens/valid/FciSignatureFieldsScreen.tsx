import {
  Divider,
  FooterActions,
  H2,
  IOVisualCostants,
  ListItemHeader,
  useFooterActionsMeasurements,
  VSpacer
} from "@io-app/design-system";
import { Route, StackActions, useRoute } from "@react-navigation/native";
import { constFalse, increment, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import I18n from "i18next";
import { isEqual } from "lodash";
import {
  ComponentProps,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { SectionList, View } from "react-native";

import {
  Clause,
  TypeEnum as ClausesTypeEnum
} from "../../../../../definitions/fci/Clause";
import { DocumentDetailView } from "../../../../../definitions/fci/DocumentDetailView";
import { DocumentToSign } from "../../../../../definitions/fci/DocumentToSign";
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import { LightModalContext } from "../../../../components/ui/LightModal";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton.ts";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import {
  trackFciShowSignatureFields,
  trackFciSignatureFieldsView,
  trackFciStartSignature
} from "../../analytics";
import DocumentWithSignature from "../../components/DocumentWithSignature";
import SignatureFieldItem from "../../components/SignatureFieldItem";
import SignatureStatusComponent from "../../components/SignatureStatusComponent";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { useFciSignatureFieldInfo } from "../../hooks/useFciSignatureFieldInfo";
import { FCI_ROUTES } from "../../navigation/routes";
import {
  fciEndRequest,
  fciUpdateDocumentSignaturesRequest
} from "../../store/actions";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import {
  fciDocumentSignatureFieldsSelector,
  fciSignatureDetailDocumentsSelector
} from "../../store/reducers/fciSignatureRequest";
import {
  getClauseLabel,
  getRequiredSignatureFields,
  getSectionListData,
  orderSignatureFields
} from "../../utils/signatureFields";

export type FciSignatureFieldsScreenNavigationParams = Readonly<{
  currentDoc: number;
  documentId: DocumentDetailView["id"];
}>;

const FciSignatureFieldsScreen = () => {
  const { currentDoc, documentId: docId } =
    useRoute<
      Route<"FCI_SIGNATURE_FIELDS", FciSignatureFieldsScreenNavigationParams>
    >().params;

  const documentsSelector = useIOSelector(fciSignatureDetailDocumentsSelector);
  const signatureFieldsSelector = useIOSelector(
    fciDocumentSignatureFieldsSelector(docId)
  );
  const documentsSignaturesSelector = useIOSelector(
    fciDocumentSignaturesSelector
  );
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const [isClausesChecked, setIsClausesChecked] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const { showModal, hideModal } = useContext(LightModalContext);

  const { footerActionsMeasurements, handleFooterActionsMeasurements } =
    useFooterActionsMeasurements();

  useOnFirstRender(() => {
    trackFciSignatureFieldsView();
  });

  useHardwareBackButton(() => {
    if (!isPreviewModalVisible) {
      navigation.goBack();
    }
    return true;
  });

  const dismissModal = () => {
    setIsPreviewModalVisible(false);
    hideModal();
  };

  // get signatureFields for the current document
  const docSignatures = useMemo(
    () =>
      pipe(
        documentsSignaturesSelector,
        RA.findFirst(doc => doc.document_id === docId)
      ),
    [docId, documentsSignaturesSelector]
  );

  // get required signatureFields for the current document
  // that user should check to sign the document
  const requiredFields = useMemo(
    () => getRequiredSignatureFields(signatureFieldsSelector),
    [signatureFieldsSelector]
  );

  useEffect(() => {
    // get the required signature fields for the current document,
    // which the user has previously checked to sign it
    const res = pipe(
      requiredFields,
      RA.map(signatureField =>
        pipe(
          docSignatures,
          RA.fromOption,
          RA.map(doc => doc.signature_fields),
          RA.map(fields => fields.filter(f => isEqual(f, signatureField))),
          RA.flatten
        )
      ),
      RA.flatten
    );

    setIsClausesChecked(res.length >= requiredFields.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docSignatures]);

  const { present, bottomSheet: fciAbortSignature } = useFciAbortSignatureFlow({
    showDialogOnBack: false,
    onBackPress: () => {
      if (isPreviewModalVisible) {
        dismissModal();
      } else {
        navigation.goBack();
      }
    }
  });

  const { present: presentInfo, bottomSheet: fciSignaturefieldInfo } =
    useFciSignatureFieldInfo();

  const onPressDetail = (signatureField: SignatureField) => {
    trackFciShowSignatureFields(fciEnvironment);
    setIsPreviewModalVisible(true);
    showModal(
      <DocumentWithSignature
        attrs={signatureField.attrs}
        currentDoc={currentDoc}
        onClose={dismissModal}
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
    dismissModal();
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
            ? [...doc.signature_fields.filter(f => !isEqual(f, item))]
            : [...doc.signature_fields, item]
        })
      )
    );

  const renderSectionHeader = (info: { section: { title: string } }) => {
    const clauseLabel = getClauseLabel(info.section.title as Clause["type"]);

    const isUnfairClause = info.section.title === ClausesTypeEnum.UNFAIR;

    return (
      <>
        <VSpacer size={12} />
        <ListItemHeader
          endElement={
            isUnfairClause
              ? {
                  type: "iconButton",
                  componentProps: {
                    icon: "info",
                    accessibilityLabel: I18n.t("global.buttons.info"),
                    onPress: presentInfo
                  }
                }
              : undefined
          }
          label={clauseLabel}
        />
        {isUnfairClause && fciSignaturefieldInfo}
      </>
    );
  };

  const renderSignatureFields = () => (
    <SectionList
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      ItemSeparatorComponent={() => <Divider />}
      keyExtractor={(item, index) => `${item.clause.title}${index}`}
      ListHeaderComponent={() => (
        <>
          <H2>{I18n.t("features.fci.signatureFields.title")}</H2>
          <VSpacer size={32} />
        </>
      )}
      renderItem={({ item }) => (
        <SignatureFieldItem
          disabled={item.clause.type === ClausesTypeEnum.REQUIRED}
          onChange={v => onChange(v, item)}
          onPressDetail={() => onPressDetail(item)}
          title={item.clause.title}
          value={pipe(
            documentsSignaturesSelector,
            RA.findFirst(doc => doc.document_id === docId),
            O.chain(document => O.fromNullable(document)),
            O.map(doc => doc.signature_fields),
            O.map(RA.filter(f => isEqual(f, item))),
            O.fold(constFalse, RA.isNonEmpty)
          )}
        />
      )}
      renderSectionHeader={renderSectionHeader}
      sections={getSectionListData(
        orderSignatureFields(signatureFieldsSelector)
      )}
      stickySectionHeadersEnabled={false}
      testID={"FciSignatureFieldsSectionListTestID"}
    />
  );

  const actions: ComponentProps<typeof FooterActions>["actions"] = {
    type: "TwoButtons",
    primary: {
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
      label:
        currentDoc < documentsSelector.length - 1
          ? I18n.t("global.buttons.continue")
          : "Firma"
    },
    secondary: {
      onPress: present,
      label: I18n.t("global.buttons.cancel")
    }
  };

  useHeaderSecondLevel({
    title: I18n.t("features.fci.title"),
    supportRequest: true,
    contextualHelp: emptyContextualHelp
  });

  if (isError) {
    return (
      <SignatureStatusComponent
        onPress={() => dispatch(fciEndRequest())}
        pictogram={"umbrella"}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        testID={"FciGenericErrorTestID"}
        title={I18n.t("features.fci.errors.generic.default.title")}
      />
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: footerActionsMeasurements.safeBottomAreaHeight
      }}
      testID={"FciSignatureFieldsTestID"}
    >
      {renderSignatureFields()}
      <FooterActions
        actions={actions}
        onMeasure={handleFooterActionsMeasurements}
      />
      {fciAbortSignature}
    </View>
  );
};
export default FciSignatureFieldsScreen;
