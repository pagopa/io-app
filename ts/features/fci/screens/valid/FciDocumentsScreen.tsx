import * as React from "react";
import Pdf from "react-native-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import ReactNativeBlobUtil from "react-native-blob-util";
import { constNull, pipe } from "fp-ts/lib/function";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as S from "fp-ts/lib/string";
import * as O from "fp-ts/lib/Option";
import { SafeAreaView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import IconFont from "../../../../components/ui/IconFont";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOColors } from "../../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import DocumentsNavigationBar from "../../components/DocumentsNavigationBar";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useFciAbortSignatureFlow } from "../../hooks/useFciAbortSignatureFlow";
import { fciSignatureDetailDocumentsSelector } from "../../store/reducers/fciSignatureRequest";
import { FCI_ROUTES } from "../../navigation/routes";
import { SignatureField } from "../../../../../definitions/fci/SignatureField";
import { TypeEnum as ClauseType } from "../../../../../definitions/fci/Clause";
import { FciParamsList } from "../../navigation/params";
import { ExistingSignatureFieldAttrs } from "../../../../../definitions/fci/ExistingSignatureFieldAttrs";
import { DocumentToSign } from "../../../../../definitions/fci/DocumentToSign";
import { fciUpdateDocumentSignaturesRequest } from "../../store/actions";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { useIODispatch } from "../../../../store/hooks";
import { SignatureFieldToBeCreatedAttrs } from "../../../../../definitions/fci/SignatureFieldToBeCreatedAttrs";

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

export type FciDocumentsScreenNavigationParams = Readonly<{
  attrs: SignatureField["attrs"];
  currentDoc: number;
}>;

type SignatureFieldAttrType =
  | ExistingSignatureFieldAttrs
  | SignatureFieldToBeCreatedAttrs;

const hasUniqueName = (
  f: SignatureFieldAttrType
): f is ExistingSignatureFieldAttrs =>
  (f as ExistingSignatureFieldAttrs).unique_name !== undefined;

const pdfFromBase64 = (r: string) => `data:application/pdf;base64,${r}`;

const FciDocumentsScreen = () => {
  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [currentDoc, setCurrentDoc] = React.useState(0);
  const [signaturePage, setSignaturePage] = React.useState(0);
  const [pdfString, setPdfString] = React.useState<string>("");
  const [isPdfLoaded, setIsPdfLoaded] = React.useState(false);
  const [currentDocPath, setCurrentDocPath] = React.useState("");
  const documents = useSelector(fciSignatureDetailDocumentsSelector);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<FciParamsList, "FCI_DOCUMENTS">>();
  const attrs = route.params.attrs as
    | ExistingSignatureFieldAttrs
    | SignatureFieldToBeCreatedAttrs;
  const cDoc = route.params.currentDoc;
  const documentSignaturesSelector = useSelector(fciDocumentSignaturesSelector);
  const dispatch = useIODispatch();

  React.useEffect(() => {
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
  }, [dispatch, documentSignaturesSelector, documents]);

  /**
   * Get the pdf url from documents,
   * download it as base64 string and
   * load the pdf as pdf-lib object
   * to draw a rect over the signature field
   * @param uniqueName the of the signature field
   */
  const drawRectangleOverSignatureFieldById = React.useCallback(
    async (uniqueName: string) => {
      // TODO: refactor this function to use fp-ts
      const doc = documents[currentDoc];
      const url = doc.url;

      const existingPdfBytes = await ReactNativeBlobUtil.config({
        fileCache: true
      })
        .fetch("GET", url)
        .then(res => res.base64());

      setIsPdfLoaded(false);

      await PDFDocument.load(pdfFromBase64(existingPdfBytes)).then(res => {
        // get the signature field by unique name
        pipe(
          res.findPageForAnnotationRef(
            res.getForm().getSignature(uniqueName).ref
          ),
          O.fromNullable,
          O.map(pageRef => {
            const page = res.getPages().indexOf(pageRef);
            setSignaturePage(page + 1);
            // The signature field is extracted by its unique_name.
            // Using low-level acrofield (acrobat field) it is possible
            // to obtain the elements of the signature field such as the
            // box that contains it. Once the box is obtained, its
            // coordinates are used to draw a rectangle on the related page.
            const signature = res.getForm().getSignature(uniqueName);
            const [widget] = signature.acroField.getWidgets();
            const rect = widget.getRectangle();
            res.getPage(page).drawRectangle({
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              color: rgb(0, 0.77, 0.79),
              opacity: 0.5,
              borderOpacity: 0.75
            });
          })
        );

        return res.saveAsBase64().then(r => setPdfString(pdfFromBase64(r)));
      });
    },
    [documents, currentDoc]
  );

  /**
   * Get the pdf url from documents,
   * download it as base64 string and
   * load the pdf as pdf-lib object
   * to draw a rect over the signature field
   * giving a set of coordinates
   * @param attrs the signature field attrs containing the coords
   */
  const drawRectangleOverSignatureFieldByCoordinates = React.useCallback(
    async (attrs: SignatureFieldToBeCreatedAttrs) => {
      // TODO: refactor this function to use fp-ts
      const doc = documents[currentDoc];
      const url = doc.url;

      const existingPdfBytes = await ReactNativeBlobUtil.config({
        fileCache: true
      })
        .fetch("GET", url)
        .then(res => res.base64());

      setIsPdfLoaded(false);

      await PDFDocument.load(pdfFromBase64(existingPdfBytes)).then(res => {
        const page = attrs.page;
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        setSignaturePage(page.valueOf() + 1);
        // The signature box is drawn using the coordinates of the signature field.
        res.getPage(page).drawRectangle({
          x: attrs.bottom_left.x ?? 0,
          y: attrs.bottom_left.y ?? 0,
          height: Math.abs(
            (attrs.top_right.y ?? 0) - (attrs.bottom_left.y ?? 0)
          ),
          width: Math.abs(
            (attrs.top_right.x ?? 0) - (attrs.bottom_left.x ?? 0)
          ),
          color: rgb(0, 0.77, 0.79),
          opacity: 0.5,
          borderOpacity: 0.75
        });

        return res.saveAsBase64().then(r => setPdfString(pdfFromBase64(r)));
      });
    },
    [documents, currentDoc]
  );

  const onSignatureDetail = React.useCallback(
    (attrs: ExistingSignatureFieldAttrs | SignatureFieldToBeCreatedAttrs) => {
      if (hasUniqueName(attrs)) {
        drawRectangleOverSignatureFieldById(attrs.unique_name).catch(
          readableReport // TODO: it should be displayed to the user?
        );
      } else {
        drawRectangleOverSignatureFieldByCoordinates(attrs).catch(
          readableReport // TODO: it should be displayed to the user?
        );
      }
    },
    [
      drawRectangleOverSignatureFieldByCoordinates,
      drawRectangleOverSignatureFieldById
    ]
  );

  React.useEffect(() => {
    if (documents.length !== 0) {
      ReactNativeBlobUtil.config({ fileCache: true, session: "FCI" })
        .fetch("GET", documents[currentDoc].url)
        .then(res => setCurrentDocPath(res.path()))
        .catch(readableReport);
    }
  }, [currentDoc, documents]);

  React.useEffect(() => {
    pipe(
      attrs,
      O.fromNullable,
      O.map(_ => {
        setCurrentDoc(cDoc);
        onSignatureDetail(_);
      }),
      O.getOrElse(() => {
        setCurrentDoc(cDoc ?? 0);
        setPdfString("");
        setSignaturePage(0);
      })
    );
  }, [attrs, cDoc, onSignatureDetail]);

  React.useEffect(() => {
    if (isPdfLoaded) {
      pipe(
        pdfRef.current,
        O.fromNullable,
        O.map(_ => _.setPage(signaturePage))
      );
    }
  }, [pdfRef, signaturePage, isPdfLoaded]);

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const onContinuePress = () =>
    navigation.navigate(FCI_ROUTES.SIGNATURE_FIELDS, {
      documentId: documents[currentDoc].id,
      currentDoc
    });

  const onCancelPress = () => present();

  const cancelButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: onCancelPress,
    title: I18n.t("features.fci.documents.footer.cancel")
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: onContinuePress,
    title: I18n.t("features.fci.documents.footer.continue")
  };

  const pointToPage = (page: number) =>
    pipe(
      pdfRef.current,
      O.fromNullable,
      O.map(_ => _.setPage(page))
    );

  const keepReadingButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: () => pointToPage(totalPages),
    title: I18n.t("global.buttons.continue")
  };

  const gotoSignatureButtonProps = {
    block: true,
    primary: true,
    onPress: onContinuePress,
    title: I18n.t("features.fci.documents.footer.confirm")
  };

  const renderPager = () => (
    <Pdf
      ref={pdfRef}
      source={{
        uri: S.isEmpty(pdfString) ? `${currentDocPath}` : pdfString
      }}
      onLoadProgress={() => setIsPdfLoaded(false)}
      onLoadComplete={(numberOfPages, _) => {
        setTotalPages(numberOfPages);
        setIsPdfLoaded(true);
      }}
      onPageChanged={(page, _) => {
        setCurrentPage(page);
      }}
      onError={constNull}
      onPressLink={constNull}
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

  const customGoBack: React.ReactElement = (
    <TouchableDefaultOpacity
      onPress={onCancelPress}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont name={"io-close"} style={{ color: IOColors.bluegrey }} />
    </TouchableDefaultOpacity>
  );

  const renderFooterButtons = () => {
    if (S.isEmpty(pdfString)) {
      return currentPage < totalPages
        ? keepReadingButtonProps
        : continueButtonProps;
    } else {
      return gotoSignatureButtonProps;
    }
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("features.fci.title")}
      customGoBack={customGoBack}
      contextualHelp={emptyContextualHelp}
    >
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
        iconLeftColor={
          currentPage === 1 ? IOColors.bluegreyLight : IOColors.blue
        }
        iconRightColor={
          currentPage === totalPages ? IOColors.bluegreyLight : IOColors.blue
        }
        onPrevious={onPrevious}
        onNext={onNext}
        disabled={false}
        testID={"FciDocumentsNavBarTestID"}
      />
      <SafeAreaView style={IOStyles.flex} testID={"FciDocumentsScreenTestID"}>
        {documents.length > 0 && (
          <>
            {renderPager()}
            <FooterWithButtons
              type={"TwoButtonsInlineThird"}
              leftButton={cancelButtonProps}
              rightButton={renderFooterButtons()}
            />
          </>
        )}
      </SafeAreaView>
      {fciAbortSignature}
    </BaseScreenComponent>
  );
};
export default FciDocumentsScreen;
