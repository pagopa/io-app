import * as S from "fp-ts/lib/string";
import I18n from "i18next";
import { ReactElement, useEffect, useState } from "react";

import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton.ts";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import {
  trackFciTosDocPreview,
  trackFciTosDocPreviewFailure,
  trackFciTosDocPreviewFailureAction
} from "../../analytics";
import { DocumentViewer } from "../../components/DocumentViewer";
import SignatureStatusComponent from "../../components/SignatureStatusComponent";
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

  useHardwareBackButton(() => {
    dispatch(fciDownloadPreviewClear({ path: fciDownloadPath }));
    return true;
  });

  useEffect(() => {
    if (isError) {
      trackFciTosDocPreviewFailure();
    } else {
      trackFciTosDocPreview();
    }
  }, [isError]);

  if (isError) {
    return (
      <SignatureStatusComponent
        onPress={() => {
          trackFciTosDocPreviewFailureAction(
            "custom_1",
            I18n.t("features.fci.errors.buttons.close")
          );
          dispatch(fciEndRequest());
        }}
        onPressAssistance={() =>
          trackFciTosDocPreviewFailureAction(
            "custom_2",
            I18n.t("features.fci.errors.buttons.assistance")
          )
        }
        pictogram={"umbrella"}
        retry={false}
        subTitle={I18n.t("features.fci.errors.generic.default.subTitle")}
        title={I18n.t("features.fci.errors.generic.default.title")}
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
