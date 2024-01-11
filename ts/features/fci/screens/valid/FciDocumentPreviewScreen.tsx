import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import * as S from "fp-ts/lib/string";
import { HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { DocumentViewer } from "../../components/DocumentViewer";
import { FciParamsList } from "../../navigation/params";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciDownloadPreviewClear, fciEndRequest } from "../../store/actions";
import { fciDownloadPathSelector } from "../../store/reducers/fciDownloadPreview";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";

export type FciDocumentPreviewScreenNavigationParams = Readonly<{
  documentUrl: string;
  enableAnnotationRendering?: boolean;
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
  const enableAnnotationRendering =
    props.route.params.enableAnnotationRendering;
  const fciDownloadPath = useIOSelector(fciDownloadPathSelector);
  const dispatch = useIODispatch();
  const navigation = useNavigation();

  const startSupportRequest = useStartSupportRequest({
    contextualHelp: emptyContextualHelp
  });

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          goBack={() =>
            dispatch(fciDownloadPreviewClear({ path: fciDownloadPath }))
          }
          title={I18n.t("messagePDFPreview.title")}
          type={"singleAction"}
          backAccessibilityLabel={I18n.t("global.buttons.back")}
          firstAction={{
            icon: "help",
            onPress: startSupportRequest,
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.open.label"
            )
          }}
        />
      )
    });
  }, [dispatch, fciDownloadPath, navigation, startSupportRequest]);

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

  return (
    <>
      <SafeAreaView
        style={styles.container}
        testID={"FciDocumentPreviewScreenTestID"}
      >
        {S.isEmpty(documentUrl) === false && (
          <DocumentViewer
            enableAnnotationRendering={enableAnnotationRendering}
            documentUrl={documentUrl}
            onError={() => setIsError(true)}
          />
        )}
      </SafeAreaView>
    </>
  );
};
