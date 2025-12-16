import {
  ContentWrapper,
  FooterActions,
  H5,
  HSpacer,
  IconButton,
  IOColors,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useCallback, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import Pdf from "react-native-pdf";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExistingSignatureFieldAttrs } from "../../../../definitions/fci/ExistingSignatureFieldAttrs";
import { SignatureFieldToBeCreatedAttrs } from "../../../../definitions/fci/SignatureFieldToBeCreatedAttrs";
import { ButtonBlockProps } from "../../../components/ui/utils/buttons";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { WithTestID } from "../../../types/WithTestID";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { fciDocumentSignatureFields } from "../store/actions";
import { fciSignatureFieldDrawingSelector } from "../store/reducers/fciSignatureFieldDrawing";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import DocumentsNavigationBar from "./DocumentsNavigationBar";
import LoadingComponent from "./LoadingComponent";

export type SignatureFieldAttrType =
  | ExistingSignatureFieldAttrs
  | SignatureFieldToBeCreatedAttrs;

type Props = WithTestID<{
  attrs: SignatureFieldAttrType;
  currentDoc: number;
  onClose: () => void;
  onError: () => void;
}>;

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors["grey-700"]
  },
  headerTitle: {
    flex: 1,
    textAlign: "center"
  }
});

const DocumentWithSignature = (props: Props) => {
  const pdfRef = useRef<Pdf>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const documents = useIOSelector(fciSignatureDetailDocumentsSelector);
  const parsedDocuments = useIOSelector(fciSignatureFieldDrawingSelector);
  const { attrs, currentDoc } = props;
  const dispatch = useIODispatch();
  const onContinuePress = () => props.onClose();

  const theme = useIOTheme();

  const continueButtonProps: ButtonBlockProps = {
    onPress: onContinuePress,
    label: I18n.t("features.fci.documents.footer.backToSignFieldsList")
  };

  /**
   * Dispatches the request to draw the signature field on the pdf.
   */
  useOnFirstRender(() => {
    dispatch(
      fciDocumentSignatureFields.request({
        uri: documents[currentDoc].url,
        attrs
      })
    );
  });

  /**
   * Points the pdf to the given page by using its ref.
   * @param page the page to point the pdf to
   */
  const pointToPage = (page: number) =>
    pipe(
      pdfRef.current,
      O.fromNullable,
      O.map(_ => _.setPage(page))
    );

  /**
   * Renders the pdf with the signature field drawn on it.
   */
  const RenderPdf = useCallback(
    ({ document, page }: { document: string; page: number }) => (
      /** Be aware that, in react-native-pdf 6.7.7, on Android, there
       * is a bug where onLoadComplete callback is not called. So,
       * in order to detect proper PDF loading ending, we rely on
       * onPageChanged, which is called to report that the first page
       * has loaded */
      <Pdf
        ref={pdfRef}
        source={{
          uri: document
        }}
        page={page}
        onLoadComplete={(numberOfPages, _) => {
          setTotalPages(numberOfPages);
        }}
        onPageChanged={(internalPage, numberOfPages) => {
          if (totalPages === 0) {
            setTotalPages(numberOfPages);
          }
          setCurrentPage(internalPage);
        }}
        // TODO: add test for errors https://pagopa.atlassian.net/browse/SFEQS-1606
        onError={props.onError}
        onPressLink={constNull}
        enablePaging
        style={styles.pdf}
      />
    ),
    [props.onError, totalPages]
  );

  /**
   * Callback to be used when the user presses the previous button.
   * It decrements the current page and points the pdf to the new page.
   */
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

  /**
   * Callback to be used when the user presses the next button.
   * It increments the current page and points the pdf to the new page.
   */
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

  /**
   * Callback to be used when the pdf cannot be loaded or the signature field cannot be drawn.
   * It returns an empty fragment and calls the `onError` callback.
   */
  const ErrorView = useCallback(() => {
    props.onError();
    return <></>;
  }, [props]);

  /**
   * Renders the pdf, a loading view or an error view depending on the state of the pot.
   */
  const RenderMask = useCallback(
    () =>
      pot.fold(
        parsedDocuments,
        () => <LoadingComponent />,
        () => <LoadingComponent />,
        () => <LoadingComponent />,
        () => <ErrorView />,
        some => (
          <RenderPdf document={some.drawnBase64} page={some.signaturePage} />
        ),
        () => <LoadingComponent />,
        () => <LoadingComponent />,
        () => <ErrorView />
      ),
    [ErrorView, RenderPdf, parsedDocuments]
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: IOColors[theme["appBackground-primary"]]
      }}
      testID={"FciDocumentsScreenTestID"}
      edges={["top", "left", "right"]}
    >
      <ContentWrapper style={{ alignItems: "center", flexDirection: "row" }}>
        <HSpacer />
        <H5 style={styles.headerTitle}>{I18n.t("messagePDFPreview.title")}</H5>
        <IconButton
          color="neutral"
          accessibilityLabel={I18n.t("global.buttons.close")}
          icon="closeLarge"
          onPress={props.onClose}
          testID="FciDocumentWithSignatureTopRightButtonTestID"
        />
      </ContentWrapper>
      <VSpacer />
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
      <RenderMask />
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: continueButtonProps
        }}
      />
    </SafeAreaView>
  );
};
export default DocumentWithSignature;
