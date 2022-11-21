import * as React from "react";
import Pdf from "react-native-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import ReactNativeBlobUtil from "react-native-blob-util";
import { constNull, pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import * as O from "fp-ts/lib/Option";
import { toError } from "fp-ts/lib/Either";
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
import { FciParamsList } from "../../navigation/params";
import { ExistingSignatureFieldAttrs } from "../../../../../definitions/fci/ExistingSignatureFieldAttrs";

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

const FciDocumentsScreen = () => {
  const pdfRef = React.useRef<Pdf>(null);
  const [totalPages, setTotalPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [currentDoc, setCurrentDoc] = React.useState(0);
  const [signaturePage, setSignaturePage] = React.useState(0);
  const [pdfString, setPdfString] = React.useState<string>("");
  const documents = useSelector(fciSignatureDetailDocumentsSelector);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<FciParamsList, "FCI_DOCUMENTS">>();
  const attrs = route.params.attrs as ExistingSignatureFieldAttrs;
  const cDoc = route.params.currentDoc;

  React.useEffect(() => {
    pipe(
      attrs,
      O.fromNullable,
      O.map(_ => {
        setCurrentDoc(cDoc);
        onSignatureDetail(_);
      }),
      O.getOrElse(() => {
        setCurrentDoc(0);
        setPdfString("");
        setSignaturePage(0);
      })
    );
  }, [attrs, cDoc]);

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
    title: I18n.t("global.buttons.cancel")
  };

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: onContinuePress,
    title: I18n.t("global.buttons.continue")
  };

  const keepReadingButtonProps = {
    block: true,
    light: true,
    bordered: true,
    onPress: () =>
      pipe(
        pdfRef.current,
        O.fromNullable,
        O.map(_ => _.setPage(totalPages))
      ),
    title: I18n.t("global.buttons.continue")
  };

  const gotoSignatureButtonProps = {
    block: true,
    primary: true,
    onPress: onContinuePress,
    title: "Procedi alla firma"
  };

  /**
   * function to draw a rect over a signature field
   * @param ids
   */
  const drawRectangleOverSignatureField = async (ids: string) => {
    const doc = documents[currentDoc];
    const url = doc.url;

    const existingPdfBytes = await ReactNativeBlobUtil.fetch("GET", url).then(
      res => res.base64()
    );

    const pdfDoc = PDFDocument.load(
      `data:application/pdf;base64,${existingPdfBytes}`
    );

    // TODO: refactor this code to use fp-ts
    await pdfDoc.then(res => {
      pipe(
        res.findPageForAnnotationRef(res.getForm().getSignature(ids).ref),
        O.fromNullable,
        O.map(pageRef => {
          const page = res.getPages().indexOf(pageRef);
          setSignaturePage(page + 1);
          const signature = res.getForm().getSignature(ids);
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

      return res
        .saveAsBase64()
        .then(r => setPdfString(`data:application/pdf;base64,${r}`));
    });
  };

  const onSignatureDetail = (attrs: ExistingSignatureFieldAttrs) => {
    drawRectangleOverSignatureField(attrs.unique_name).catch(toError);
  };

  const renderPager = () => (
    <Pdf
      ref={pdfRef}
      source={{
        uri: S.isEmpty(pdfString) ? `${documents[currentDoc].url}` : pdfString
      }}
      onLoadComplete={(numberOfPages, _) => {
        setTotalPages(numberOfPages);
        pipe(
          pdfRef.current,
          O.fromNullable,
          O.map(_ => _.setPage(signaturePage))
        );
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
      currentDoc,
      O.fromNullable,
      O.chain(doc => (doc > 0 ? O.some(doc - 1) : O.none)),
      O.map(setCurrentDoc)
    );
  };

  const onNext = () => {
    pipe(
      currentDoc,
      O.fromNullable,
      O.chain(doc => (doc < documents.length - 1 ? O.some(doc + 1) : O.none)),
      O.map(setCurrentDoc)
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
        titleLeft={I18n.t("features.fci.documentsBar.titleLeft", {
          currentDoc: currentDoc + 1,
          totalDocs: documents.length
        })}
        titleRight={I18n.t("features.fci.documentsBar.titleRight", {
          currentPage,
          totalPages
        })}
        iconLeftColor={
          currentDoc === 0 ? IOColors.bluegreyLight : IOColors.blue
        }
        iconRightColor={
          currentDoc === documents.length - 1
            ? IOColors.bluegreyLight
            : IOColors.blue
        }
        onPrevious={onPrevious}
        onNext={onNext}
        disabled={!S.isEmpty(pdfString)}
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
