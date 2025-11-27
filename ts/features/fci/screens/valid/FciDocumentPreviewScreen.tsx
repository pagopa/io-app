import * as S from "fp-ts/lib/string";
import { ReactElement, useState } from "react";
import I18n from "i18next";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { DocumentViewer } from "../../components/DocumentViewer";
import GenericErrorComponent from "../../components/GenericErrorComponent";
import { FciParamsList } from "../../navigation/params";
import { fciDownloadPreviewClear, fciEndRequest } from "../../store/actions";
import { fciDownloadPathSelector } from "../../store/reducers/fciDownloadPreview";

export type FciDocumentPreviewScreenNavigationParams = Readonly<{
  documentUrl: string;
}>;

export const FciDocumentPreviewScreen = (
  props: IOStackNavigationRouteProps<FciParamsList, "FCI_DOC_PREVIEW">
): ReactElement => {
  const [isError, setIsError] = useState(false);
  const documentUrl = props.route.params.documentUrl ?? "";
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
          documentUrl={documentUrl}
          onError={() => setIsError(true)}
        />
      )}
    </>
  );
};
