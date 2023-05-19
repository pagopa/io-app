import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import * as S from "fp-ts/lib/string";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { DocumentViewer } from "../../components/DocumentViewer";
import { FciParamsList } from "../../navigation/params";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciDownloadPreviewClear, fciEndRequest } from "../../store/actions";
import { fciDownloadPathSelector } from "../../store/reducers/fciDownloadPreview";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import { Icon } from "../../../../components/core/icons/Icon";

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
  const documentUrl = props.route.params.documentUrl ?? "";
  const fciDownloadPath = useIOSelector(fciDownloadPathSelector);
  const dispatch = useIODispatch();

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
        dispatch(fciDownloadPreviewClear({ path: fciDownloadPath }));
      }}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <Icon name="legChevronLeft" color="bluegrey" />
    </TouchableDefaultOpacity>
  );

  return (
    <BaseScreenComponent
      goBack={true}
      customGoBack={customGoBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("messagePDFPreview.title")}
    >
      <SafeAreaView
        style={styles.container}
        testID={"FciDocumentPreviewScreenTestID"}
      >
        {S.isEmpty(documentUrl) === false && (
          <DocumentViewer
            documentUrl={documentUrl}
            onError={() => setIsError(true)}
          />
        )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
