import * as React from "react";
import Pdf from "react-native-pdf";
import { Body, Container, Left, Right } from "native-base";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SafeAreaView, StyleSheet } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import IconFont from "../../../components/ui/IconFont";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { IOColors } from "../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { ExistingSignatureFieldAttrs } from "../../../../definitions/fci/ExistingSignatureFieldAttrs";
import { SignatureFieldToBeCreatedAttrs } from "../../../../definitions/fci/SignatureFieldToBeCreatedAttrs";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import AppHeader from "../../../components/ui/AppHeader";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { WithTestID } from "../../../types/WithTestID";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { H5 } from "../../../components/core/typography/H5";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { fciDocumentSignatureFields } from "../store/actions";
import { fciSignatureFieldDrawingSelector } from "../store/reducers/fciSignatureFieldDrawing";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import DocumentsNavigationBar from "./DocumentsNavigationBar";

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
    backgroundColor: IOColors.bluegrey
  }
});

const DocumentWithSignature = (props: Props) => {
  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const documents = useIOSelector(fciSignatureDetailDocumentsSelector);
  const parsedDocuments = useIOSelector(fciSignatureFieldDrawingSelector);
  const { attrs, currentDoc } = props;
  const dispatch = useIODispatch();
  const onContinuePress = () => props.onClose();
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: onContinuePress,
    title: I18n.t("features.fci.documents.footer.backToSignFieldsList")
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
  const RenderPdf = React.useCallback(
    ({ document, page }: { document: string; page: number }) => (
      <Pdf
        ref={pdfRef}
        source={{
          uri: document
        }}
        page={page + 1}
        onLoadComplete={(numberOfPages, _) => {
          setTotalPages(numberOfPages);
        }}
        onPageChanged={(page, _) => {
          setCurrentPage(page);
        }}
        // TODO: add test for errors https://pagopa.atlassian.net/browse/SFEQS-1606
        onError={props.onError}
        onPressLink={constNull}
        enablePaging
        style={styles.pdf}
      />
    ),
    [props.onError]
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
   * Renders the loading spinner.
   * @returns a loading spinner overlay
   */
  const LoadingView = () => <LoadingSpinnerOverlay isLoading={true} />;

  /**
   * Callback to be used when the pdf cannot be loaded or the signature field cannot be drawn.
   * It returns an empty fragment and calls the `onError` callback.
   */
  const ErrorView = React.useCallback(() => {
    props.onError();
    return <></>;
  }, [props]);

  /**
   * Renders the pdf, a loading view or an error view depending on the state of the pot.
   */
  const RenderMask = React.useCallback(
    () =>
      pot.fold(
        parsedDocuments,
        () => <LoadingView />,
        () => <LoadingView />,
        () => <LoadingView />,
        () => <ErrorView />,
        some => (
          <RenderPdf document={some.drawnBase64} page={some.signaturePage} />
        ),
        () => <LoadingView />,
        () => <LoadingView />,
        () => <ErrorView />
      ),
    [ErrorView, RenderPdf, parsedDocuments]
  );

  return (
    <Container>
      <AppHeader>
        <Left />
        <Body style={{ alignItems: "center" }}>
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {I18n.t("messagePDFPreview.title")}
          </H5>
        </Body>
        <Right>
          <ButtonDefaultOpacity
            onPress={props.onClose}
            transparent={true}
            testID="FciDocumentWithSignatureTopRightButtonTestID"
          >
            <IconFont name="io-close" />
          </ButtonDefaultOpacity>
        </Right>
      </AppHeader>
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
        iconLeftColor={currentPage === 1 ? "bluegreyLight" : "blue"}
        iconRightColor={currentPage === totalPages ? "bluegreyLight" : "blue"}
        onPrevious={onPrevious}
        onNext={onNext}
        disabled={false}
        testID={"FciDocumentsNavBarTestID"}
      />
      <SafeAreaView style={IOStyles.flex} testID={"FciDocumentsScreenTestID"}>
        <RenderMask />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={continueButtonProps}
        />
      </SafeAreaView>
    </Container>
  );
};
export default DocumentWithSignature;
