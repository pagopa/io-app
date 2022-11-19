import * as React from "react";
import Pdf from "react-native-pdf";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SafeAreaView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
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

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

const FciDocumentsScreen = () => {
  const [pdfRef, setPdfRef] = React.useState<Pdf | null>();
  const [totalPages, setTotalPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [currentDoc, setCurrentDoc] = React.useState(0);
  const documents = useSelector(fciSignatureDetailDocumentsSelector);
  const navigation = useNavigation();

  const { present, bottomSheet: fciAbortSignature } =
    useFciAbortSignatureFlow();

  const onCancelPress = () => present();

  const cancelButtonProps = {
    block: true,
    light: false,
    bordered: true,
    onPress: onCancelPress,
    title: I18n.t("global.buttons.cancel")
  };

  // TODO: navigate to signature fields selection screen
  const onContinuePress = () => constNull;

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
    onPress: () => pdfRef?.setPage(totalPages),
    title: I18n.t("global.buttons.continue")
  };

  const renderPager = () => (
    <Pdf
      ref={_ => setPdfRef(_)}
      source={{
        uri: `${documents[currentDoc].url}`
      }}
      onLoadComplete={(numberOfPages, _) => {
        setTotalPages(numberOfPages);
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
      onPress={navigation.goBack}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont name={"io-close"} style={{ color: IOColors.bluegrey }} />
    </TouchableDefaultOpacity>
  );

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
        testID={"FciDocumentsNavBarTestID"}
      />
      <SafeAreaView style={IOStyles.flex} testID={"FciDocumentsScreenTestID"}>
        {documents.length > 0 && (
          <>
            {renderPager()}
            <FooterWithButtons
              type={"TwoButtonsInlineThird"}
              leftButton={cancelButtonProps}
              rightButton={
                currentPage < totalPages
                  ? keepReadingButtonProps
                  : continueButtonProps
              }
            />
          </>
        )}
      </SafeAreaView>

      {fciAbortSignature}
    </BaseScreenComponent>
  );
};
export default FciDocumentsScreen;
