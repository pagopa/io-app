import * as React from "react";
import Pdf from "react-native-pdf";
import { Body, Container, Left, Right } from "native-base";
import { PDFDocument, rgb } from "pdf-lib";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import ReactNativeBlobUtil from "react-native-blob-util";
import { constNull, pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as O from "fp-ts/lib/Option";
import { SafeAreaView, StyleSheet, View } from "react-native";
import IconFont from "../../../components/ui/IconFont";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { IOColors } from "../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { ExistingSignatureFieldAttrs } from "../../../../definitions/fci/ExistingSignatureFieldAttrs";
import { SignatureFieldToBeCreatedAttrs } from "../../../../definitions/fci/SignatureFieldToBeCreatedAttrs";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import AppHeader from "../../../components/ui/AppHeader";
import { useIOSelector } from "../../../store/hooks";
import { WithTestID } from "../../../types/WithTestID";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import { H5 } from "../../../components/core/typography/H5";
import { savePath } from "../saga/networking/handleDownloadDocument";
import DocumentsNavigationBar from "./DocumentsNavigationBar";

export type SignatureFieldAttrType =
  | ExistingSignatureFieldAttrs
  | SignatureFieldToBeCreatedAttrs;

const hasUniqueName = (
  f: SignatureFieldAttrType
): f is ExistingSignatureFieldAttrs =>
  (f as ExistingSignatureFieldAttrs).unique_name !== undefined;

type Props = WithTestID<{
  attrs: SignatureFieldAttrType;
  currentDoc: number;
  onClose: () => void;
  onError?: (error: object) => void;
}>;

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

const pdfFromBase64 = (r: string) => `data:application/pdf;base64,${r}`;

const DocumentWithSignature = (props: Props) => {
  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [signaturePage, setSignaturePage] = React.useState(0);
  const [pdfString, setPdfString] = React.useState<string>("");
  const [isPdfLoaded, setIsPdfLoaded] = React.useState(false);
  const documents = useIOSelector(fciSignatureDetailDocumentsSelector);
  const { attrs, currentDoc } = props;

  /**
   * Get the pdf url from documents,
   * download it as base64 string and
   * load the pdf as pdf-lib object
   * to draw a rect over the signature field
   * @param uniqueName the of the signature field
   */
  const drawRectangleOverSignatureFieldById = React.useCallback(
    async (uniqueName: string) => {
      // TODO: refactor this function to use fp-ts https://pagopa.atlassian.net/browse/SFEQS-1601
      const existingPdfBytes = await ReactNativeBlobUtil.fs.readFile(
        `${savePath(documents[currentDoc].url)}`,
        "base64"
      );

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
    [currentDoc, documents]
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
      // TODO: refactor this function to use fp-ts https://pagopa.atlassian.net/browse/SFEQS-1601
      const existingPdfBytes = await ReactNativeBlobUtil.fs.readFile(
        `${savePath(documents[currentDoc].url)}`,
        "base64"
      );

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
    [currentDoc, documents]
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
    pipe(
      attrs,
      O.fromNullable,
      O.map(_ => {
        onSignatureDetail(_);
      }),
      O.getOrElse(() => {
        setPdfString("");
        setSignaturePage(0);
      })
    );
  }, [attrs, onSignatureDetail]);

  React.useEffect(() => {
    if (isPdfLoaded) {
      pipe(
        pdfRef.current,
        O.fromNullable,
        O.map(_ => _.setPage(signaturePage))
      );
    }
  }, [pdfRef, signaturePage, isPdfLoaded]);

  const onContinuePress = () => props.onClose();

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: onContinuePress,
    title: I18n.t("features.fci.documents.footer.backToSignFieldsList")
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
        uri: pdfString
      }}
      onLoadComplete={(numberOfPages, _) => {
        setTotalPages(numberOfPages);
        setIsPdfLoaded(true);
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

  return (
    <Container>
      <AppHeader>
        <Left />
        <Body style={{ alignItems: "center" }}>
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {I18n.t("features.mvl.details.attachments.pdfPreview.title")}
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
        {documents.length > 0 && (
          <>
            {!S.isEmpty(pdfString) ? (
              renderPager()
            ) : (
              <View style={IOStyles.flex} />
            )}
            <FooterWithButtons
              type={"SingleButton"}
              leftButton={continueButtonProps}
            />
          </>
        )}
      </SafeAreaView>
    </Container>
  );
};
export default DocumentWithSignature;
