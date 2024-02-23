import React from "react";
import * as S from "fp-ts/lib/string";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOStyles } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { DocumentViewer } from "../../components/DocumentViewer";
import { FciParamsList } from "../../navigation/params";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fciDownloadPreviewClear, fciEndRequest } from "../../store/actions";
import { fciDownloadPathSelector } from "../../store/reducers/fciDownloadPreview";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";

export type FciDocumentPreviewScreenNavigationParams = Readonly<{
  documentUrl: string;
  enableAnnotationRendering?: boolean;
}>;

export const FciDocumentPreviewScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_DOC_PREVIEW">
): React.ReactElement => {
  const [isError, setIsError] = React.useState(false);
  const documentUrl = props.route.params.documentUrl ?? "";
  const enableAnnotationRendering =
    props.route.params.enableAnnotationRendering;
  const fciDownloadPath = useIOSelector(fciDownloadPathSelector);
  const dispatch = useIODispatch();

  useHeaderSecondLevel({
    title: I18n.t("messagePDFPreview.title"),
    contextualHelp: emptyContextualHelp,
    supportRequest: true,
    goBack: () => dispatch(fciDownloadPreviewClear({ path: fciDownloadPath }))
  });

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
      {S.isEmpty(documentUrl) === false && (
        <DocumentViewer
          enableAnnotationRendering={enableAnnotationRendering}
          documentUrl={documentUrl}
          onError={() => setIsError(true)}
        />
      )}
    </>
  );
};
