import { FooterActionsInline, IOColors } from "@pagopa/io-app-design-system";
import {
  RouteProp,
  StackActions,
  useIsFocused,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as S from "fp-ts/lib/string";
import { useRef, useState, useEffect, ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import Pdf, { PdfRef } from "react-native-pdf";
import I18n from "i18next";
import { TypeEnum as ClauseType } from "../../../../../definitions/fci/Clause";
import { DocumentToSign } from "../../../../../definitions/fci/DocumentToSign";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { trackFciDocOpeningSuccess, trackFciSigningDoc } from "../../analytics";
import DocumentsNavigationBar from "../../components/DocumentsNavigationBar";
import LoadingComponent from "../../components/LoadingComponent";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { useFciNoSignatureFields } from "../../hooks/useFciNoSignatureFields";
import { FciParamsList } from "../../navigation/params";
import { FCI_ROUTES } from "../../navigation/routes";
import {
  fciClearStateRequest,
  fciDownloadPreview,
  fciUpdateDocumentSignaturesRequest
} from "../../store/actions";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { fciDownloadPathSelector } from "../../store/reducers/fciDownloadPreview";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import { fciSignatureDetailDocumentsSelector } from "../../store/reducers/fciSignatureRequest";
import {
  getOptionalSignatureFields,
  getRequiredSignatureFields,
  getSignatureFieldsLength
} from "../../utils/signatureFields";

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors["grey-700"]
  }
});

export type FciDocumentsScreenNavigationParams = Readonly<{
  currentDoc: number;
}>;

const FciDocumentsScreen = () => {
  const pdfRef = useRef<PdfRef>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const route = useRoute<RouteProp<FciParamsList, "FCI_DOCUMENTS">>();
  const currentDoc = route.params.currentDoc ?? 0;
  const documents = useIOSelector(fciSignatureDetailDocumentsSelector);
  const downloadPath = useIOSelector(fciDownloadPathSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const navigation = useNavigation();
  const documentSignaturesSelector = useIOSelector(
    fciDocumentSignaturesSelector
  );
  const dispatch = useIODispatch();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (documents.length !== 0 && isFocused) {
      dispatch(fciDownloadPreview.request({ url: documents[currentDoc].url }));
    }
    // if the user hasn't checked any signauture field,
    // we need to initialize the documentSignatures state
    if (RA.isEmpty(documentSignaturesSelector)) {
      pipe(
        documents,
        RA.map(d => {
          const docSignature = {
            document_id: d.id,
            signature_fields: d.metadata.signature_fields.filter(
              s => s.clause.type === ClauseType.REQUIRED
            )
          } as DocumentToSign;
          dispatch(fciUpdateDocumentSignaturesRequest(docSignature));
        })
      );
    }
  }, [dispatch, documentSignaturesSelector, documents, currentDoc, isFocused]);

  useEffect(() => {
    // with a document opened, we can track the opening success event
    if (documents[currentDoc] && isFocused) {
      trackFciDocOpeningSuccess(
        currentDoc + 1,
        getRequiredSignatureFields(
          documents[currentDoc]?.metadata.signature_fields
        ).length,
        getOptionalSignatureFields(
          documents[currentDoc]?.metadata.signature_fields
        ).length,
        fciEnvironment
      );
    }
  }, [currentDoc, documents, isFocused, fciEnvironment]);

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const {
    present: showNoSignatureFieldsBs,
    bottomSheet: fciNoSignatureFields
  } = useFciNoSignatureFields({ currentDoc });

  const onContinuePress = () => {
    if (getSignatureFieldsLength(documents[currentDoc]) > 0) {
      trackFciSigningDoc(fciEnvironment);
      navigation.dispatch(
        StackActions.push(FCI_ROUTES.SIGNATURE_FIELDS, {
          documentId: documents[currentDoc].id,
          currentDoc
        })
      );
    } else {
      showNoSignatureFieldsBs();
    }
  };

  const onCancelPress = () => present();

  const cancelButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["startAction"] = {
    onPress: onCancelPress,
    label: I18n.t("features.fci.documents.footer.cancel")
  };

  const continueButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["endAction"] = {
    onPress: onContinuePress,
    label: I18n.t("features.fci.documents.footer.continue")
  };

  const keepReadingButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["endAction"] = {
    onPress: () => pointToPage(totalPages),
    label: I18n.t("global.buttons.continue")
  };

  const endActionButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["endAction"] =
    currentPage < totalPages ? keepReadingButtonProps : continueButtonProps;

  const pointToPage = (page: number) =>
    pipe(
      pdfRef.current,
      O.fromNullable,
      O.map(_ => _.setPage(page))
    );

  const renderPager = () => (
    /** Be aware that, in react-native-pdf 6.7.7, on Android, there
     * is a bug where onLoadComplete callback is not called. So,
     * in order to detect proper PDF loading ending, we rely on
     * onPageChanged, which is called to report that the first page
     * has loaded */
    <Pdf
      ref={pdfRef}
      source={{
        uri: `${downloadPath}`
      }}
      onLoadComplete={(numberOfPages, _) => {
        setTotalPages(numberOfPages);
      }}
      onPageChanged={(page, numberOfPages) => {
        if (totalPages === 0) {
          setTotalPages(numberOfPages);
        }
        setCurrentPage(page);
      }}
      enablePaging
      style={styles.pdf}
    />
  );

  const onPrevious = () => {
    pipe(
      currentPage,
      O.fromNullable,
      O.chain(page => (page > 1 ? O.some(page - 1) : O.none)),
      O.map(page => {
        setCurrentPage(page);
        pointToPage(page);
      })
    );
  };

  const onNext = () => {
    pipe(
      currentPage,
      O.fromNullable,
      O.chain(page => (page < totalPages ? O.some(page + 1) : O.none)),
      O.map(page => {
        setCurrentPage(page);
        pointToPage(page);
      })
    );
  };

  useHeaderSecondLevel({
    title: I18n.t("features.fci.title"),
    supportRequest: true,
    contextualHelp: emptyContextualHelp,
    goBack: () => {
      if (currentDoc <= 0) {
        dispatch(fciClearStateRequest());
      }
      navigation.goBack();
    }
  });

  if (S.isEmpty(downloadPath)) {
    return <LoadingComponent />;
  }

  return (
    <>
      <DocumentsNavigationBar
        indicatorPosition={"right"}
        titleLeft={I18n.t("features.fci.documentsBar.titleLeft", {
          currentDoc: currentDoc + 1,
          totalDocs: documents.length
        })}
        titleRight={I18n.t("features.fci.documentsBar.titleRight", {
          currentPage,
          totalPages
        })}
        iconLeftDisabled={currentPage === 1}
        iconRightDisabled={currentPage === totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
        disabled={false}
        testID={"FciDocumentsNavBarTestID"}
      />
      <View style={{ flex: 1 }} testID={"FciDocumentsScreenTestID"}>
        {documents.length > 0 && (
          <>
            {renderPager()}
            <FooterActionsInline
              startAction={cancelButtonProps}
              endAction={endActionButtonProps}
            />
          </>
        )}
      </View>
      {fciAbortSignature}
      {fciNoSignatureFields}
    </>
  );
};
export default FciDocumentsScreen;
