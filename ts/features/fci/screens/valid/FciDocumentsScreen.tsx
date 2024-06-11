import * as React from "react";
import Pdf from "react-native-pdf";
import { pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import { StyleSheet, View } from "react-native";
import {
  RouteProp,
  StackActions,
  useIsFocused,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import {
  BlockButtonProps,
  ButtonSolidProps,
  FooterWithButtons,
  IOColors,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import DocumentsNavigationBar from "../../components/DocumentsNavigationBar";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { fciSignatureDetailDocumentsSelector } from "../../store/reducers/fciSignatureRequest";
import { FCI_ROUTES } from "../../navigation/routes";
import { TypeEnum as ClauseType } from "../../../../../definitions/fci/Clause";
import { FciParamsList } from "../../navigation/params";
import { DocumentToSign } from "../../../../../definitions/fci/DocumentToSign";
import {
  fciClearStateRequest,
  fciDownloadPreview,
  fciUpdateDocumentSignaturesRequest
} from "../../store/actions";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciDownloadPathSelector } from "../../store/reducers/fciDownloadPreview";
import { trackFciDocOpeningSuccess, trackFciSigningDoc } from "../../analytics";
import {
  getOptionalSignatureFields,
  getRequiredSignatureFields,
  getSignatureFieldsLength
} from "../../utils/signatureFields";
import { useFciNoSignatureFields } from "../../hooks/useFciNoSignatureFields";
import { fciEnvironmentSelector } from "../../store/reducers/fciEnvironment";
import LoadingComponent from "../../components/LoadingComponent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

export type FciDocumentsScreenNavigationParams = Readonly<{
  currentDoc: number;
}>;

const FciDocumentsScreen = () => {
  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
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

  React.useEffect(() => {
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

  React.useEffect(() => {
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

  const cancelButtonProps: ButtonSolidProps = {
    onPress: onCancelPress,
    label: I18n.t("features.fci.documents.footer.cancel"),
    accessibilityLabel: I18n.t("features.fci.documents.footer.cancel")
  };

  const continueButtonProps: ButtonSolidProps = {
    onPress: onContinuePress,
    label: I18n.t("features.fci.documents.footer.continue"),
    accessibilityLabel: I18n.t("features.fci.documents.footer.continue")
  };

  const keepReadingButtonProps: ButtonSolidProps = {
    onPress: () => pointToPage(totalPages),
    label: I18n.t("global.buttons.continue"),
    accessibilityLabel: I18n.t("global.buttons.continue")
  };

  const secondaryButtonProps: BlockButtonProps = {
    type: currentPage < totalPages ? "Outline" : "Solid",
    buttonProps:
      currentPage < totalPages ? keepReadingButtonProps : continueButtonProps
  };

  const pointToPage = (page: number) =>
    pipe(
      pdfRef.current,
      O.fromNullable,
      O.map(_ => _.setPage(page))
    );

  const renderPager = () => (
    <Pdf
      ref={pdfRef}
      source={{
        uri: `${downloadPath}`
      }}
      onLoadComplete={(numberOfPages, _) => {
        setTotalPages(numberOfPages);
      }}
      onPageChanged={(page, _) => {
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
      <View style={IOStyles.flex} testID={"FciDocumentsScreenTestID"}>
        {documents.length > 0 && (
          <>
            {renderPager()}
            <FooterWithButtons
              type="TwoButtonsInlineThird"
              secondary={secondaryButtonProps}
              primary={{ type: "Outline", buttonProps: cancelButtonProps }}
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
