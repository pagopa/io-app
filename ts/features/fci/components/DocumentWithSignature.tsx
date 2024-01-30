import * as React from "react";
import Pdf from "react-native-pdf";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { StyleSheet, View } from "react-native";
import {
  ButtonSolidProps,
  FooterWithButtons,
  H5,
  HSpacer,
  IconButton,
  IOColors,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "../../../i18n";
import { ExistingSignatureFieldAttrs } from "../../../../definitions/fci/ExistingSignatureFieldAttrs";
import { SignatureFieldToBeCreatedAttrs } from "../../../../definitions/fci/SignatureFieldToBeCreatedAttrs";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { WithTestID } from "../../../types/WithTestID";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { fciDocumentSignatureFields } from "../store/actions";
import { fciSignatureFieldDrawingSelector } from "../store/reducers/fciSignatureFieldDrawing";
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
    backgroundColor: IOColors.bluegrey
  },
  header: {
    alignItems: "center",
    flexDirection: "row"
  },
  headerTitle: {
    flex: 1,
    textAlign: "center"
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
  const continueButtonProps: ButtonSolidProps = {
    onPress: onContinuePress,
    label: I18n.t("features.fci.documents.footer.backToSignFieldsList"),
    accessibilityLabel: I18n.t(
      "features.fci.documents.footer.backToSignFieldsList"
    )
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
        enableAnnotationRendering={false}
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
      style={[IOStyles.flex, IOStyles.bgWhite]}
      testID={"FciDocumentsScreenTestID"}
      edges={["bottom", "left", "right"]}
    >
      <View style={[IOStyles.horizontalContentPadding, styles.header]}>
        <HSpacer />
        <H5 weight={"SemiBold"} color={"bluegrey"} style={styles.headerTitle}>
          {I18n.t("messagePDFPreview.title")}
        </H5>
        <IconButton
          color="neutral"
          accessibilityLabel={I18n.t("global.buttons.close")}
          icon="closeLarge"
          onPress={props.onClose}
          testID="FciDocumentWithSignatureTopRightButtonTestID"
        />
      </View>
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
      <FooterWithButtons
        type={"SingleButton"}
        primary={{ type: "Solid", buttonProps: continueButtonProps }}
      />
    </SafeAreaView>
  );
};
export default DocumentWithSignature;
