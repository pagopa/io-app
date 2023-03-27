import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import { IOColors } from "../../../../components/core/variables/IOColors";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import IconFont from "../../../../components/ui/IconFont";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { DocumentViewer } from "../../components/DocumentViewer";
import { FciParamsList } from "../../navigation/params";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciSignatureDetailDocumentsSelector } from "../../store/reducers/fciSignatureRequest";
import DocumentsNavigationBar from "../../components/DocumentsNavigationBar";
import {
  fciDownloadPreviewClear,
  fciEndRequest,
  fciShowSignedDocumentsEndRequest
} from "../../store/actions";
import { fciDownloadPathSelector } from "../../store/reducers/fciDownloadPreview";
import GenericErrorComponent from "../../components/GenericErrorComponent";

export type FciDocumentPreviewScreenNavigationParams = Readonly<{
  documentUrl: string;
}>;

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export const FciDocumentPreviewScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_DOC_PREVIEW">
): React.ReactElement => {
  const [isError, setIsError] = React.useState(false);
  const docParamUrl = props.route.params.documentUrl ?? "";
  const [documentUrl, setDocumentUrl] = React.useState("");
  const [showDocNavBar, setShowDocNavBar] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [currentDoc, setCurrentDoc] = React.useState(0);
  const documents = useIOSelector(fciSignatureDetailDocumentsSelector);
  const fciDownloadPath = useIOSelector(fciDownloadPathSelector);
  const dispatch = useIODispatch();

  React.useEffect(() => {
    if (documents.length > 0 && S.isEmpty(docParamUrl) === true) {
      setShowDocNavBar(true);
      setDocumentUrl(documents[currentDoc].url);
    } else {
      setShowDocNavBar(false);
      setDocumentUrl(docParamUrl);
    }
  }, [currentDoc, documents, documentUrl, docParamUrl]);

  if (isError) {
    return (
      <GenericErrorComponent
        title={I18n.t("features.fci.errors.generic.default.title")}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        retry={false}
        onPress={() => dispatch(fciEndRequest())}
      />
    );
  }

  const customGoBack: React.ReactElement = (
    <TouchableDefaultOpacity
      onPress={() => {
        if (showDocNavBar) {
          dispatch(fciShowSignedDocumentsEndRequest());
        } else {
          dispatch(fciDownloadPreviewClear({ path: fciDownloadPath }));
        }
      }}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont name={"io-back"} style={{ color: IOColors.bluegrey }} />
    </TouchableDefaultOpacity>
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

  const renderDocumentsNavigationBar = () => (
    <DocumentsNavigationBar
      indicatorPosition={"left"}
      titleLeft={I18n.t("features.fci.documentsBar.titleLeft", {
        currentDoc: currentDoc + 1,
        totalDocs: documents.length
      })}
      titleRight={I18n.t("features.fci.documentsBar.titleRight", {
        currentPage,
        totalPages
      })}
      iconLeftColor={currentDoc === 0 ? IOColors.bluegreyLight : IOColors.blue}
      iconRightColor={
        currentDoc === documents.length - 1
          ? IOColors.bluegreyLight
          : IOColors.blue
      }
      onPrevious={onPrevious}
      onNext={onNext}
      disabled={false}
      testID={"FciDocumentsNavBarTestID"}
    />
  );

  return (
    <BaseScreenComponent
      goBack={true}
      customGoBack={customGoBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.mvl.details.attachments.pdfPreview.title")}
    >
      <SafeAreaView
        style={styles.container}
        testID={"FciDocumentPreviewScreenTestID"}
      >
        {showDocNavBar && renderDocumentsNavigationBar()}
        {S.isEmpty(documentUrl) === false && (
          <DocumentViewer
            onLoadComplete={(pageCount: number) => {
              setTotalPages(pageCount);
            }}
            onPageChanged={(page: number) => {
              setCurrentPage(page);
            }}
            documentUrl={documentUrl}
            onError={() => setIsError(true)}
          />
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
