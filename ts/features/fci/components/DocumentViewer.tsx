import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { constNull } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import ReactNativeBlobUtil from "react-native-blob-util";
import Pdf from "react-native-pdf";
import * as S from "fp-ts/lib/string";
import genericError from "../../../../img/wallet/errors/generic-error-icon.png";
import errorDetail from "../../../../img/servicesStatus/error-detail-icon.png";
import { IOColors } from "../../../components/core/variables/IOColors";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { isIos } from "../../../utils/platform";
import { share } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import { confirmButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { FciDownloadPreviewDirectoryPath } from "../saga/networking/handleDownloadDocument";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { fciDownloadPreview, fciDownloadPreviewClear } from "../store/actions";
import {
  fciDownloadPathSelector,
  fciDownloadPreviewSelector
} from "../store/reducers/fciDownloadPreview";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import ErrorComponent from "./ErrorComponent";

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

export const getFileNameFromUrl = (url: string) =>
  url.substring(url.lastIndexOf("/") + 1).split("?")[0] + ".pdf";

const renderFooter = (url: string, filePath: string) =>
  isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(() => {
        ReactNativeBlobUtil.ios.presentOptionsMenu(filePath);
      }, I18n.t("features.mvl.details.attachments.pdfPreview.open"))}
    />
  ) : (
    <FooterWithButtons
      type={"ThreeButtonsInLine"}
      leftButton={{
        bordered: true,
        primary: false,
        onPress: () => {
          share(
            `file://${
              FciDownloadPreviewDirectoryPath + "/" + getFileNameFromUrl(url)
            }`,
            undefined,
            false
          )().catch(_ => {
            showToast(
              I18n.t(
                "features.mvl.details.attachments.pdfPreview.errors.sharing"
              )
            );
          });
        },
        title: I18n.t("global.buttons.share")
      }}
      midButton={{
        bordered: true,
        primary: false,
        onPress: () => {
          ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: getFileNameFromUrl(url),
              parentFolder: "",
              mimeType: "application/pdf"
            },
            "Download",
            FciDownloadPreviewDirectoryPath + "/" + getFileNameFromUrl(url)
          )
            .then(_ => {
              showToast(
                I18n.t(
                  "features.mvl.details.attachments.pdfPreview.savedAtLocation",
                  {
                    name: "attachment.displayName"
                  }
                ),
                "success"
              );
            })
            .catch(_ => {
              showToast(
                I18n.t(
                  "features.mvl.details.attachments.pdfPreview.errors.saving"
                )
              );
            });
        },
        title: I18n.t("features.mvl.details.attachments.pdfPreview.save")
      }}
      rightButton={confirmButtonProps(() => {
        ReactNativeBlobUtil.android
          .actionViewIntent(
            FciDownloadPreviewDirectoryPath + "/" + getFileNameFromUrl(url),
            "application/pdf"
          )
          .catch(_ => {
            showToast(
              I18n.t(
                "features.mvl.details.attachments.pdfPreview.errors.opening"
              )
            );
          });
      }, I18n.t("features.mvl.details.attachments.pdfPreview.open"))}
    />
  );

type Props = {
  documentUrl: string;
  onLoadComplete?: (totalPages: number) => void;
  onPageChanged?: (page: number) => void;
};

const LoadingComponent = () => (
  <LoadingErrorComponent
    isLoading={true}
    loadingCaption={""}
    onRetry={constNull}
    testID={"FciRouterLoadingScreenTestID"}
  />
);
export const DocumentViewer = (props: Props): React.ReactElement => {
  const [isError, setIsError] = useState(false);
  const documentUrl = props.documentUrl;
  const dispatch = useIODispatch();
  const fciDownloadSelector = useIOSelector(fciDownloadPreviewSelector);
  const fciDownloadPath = useIOSelector(fciDownloadPathSelector);

  React.useEffect(() => {
    dispatch(fciDownloadPreview.request({ url: documentUrl }));
  }, [documentUrl, dispatch]);

  if (pot.isLoading(fciDownloadSelector)) {
    return <LoadingComponent />;
  }

  return !pot.isError(fciDownloadSelector) ? (
    <>
      {S.isEmpty(fciDownloadPath) === false && (
        <>
          <Pdf
            source={{ uri: fciDownloadPath, cache: true }}
            style={styles.pdf}
            onLoadComplete={props.onLoadComplete}
            onPageChanged={props.onPageChanged}
            onError={_ => {
              // props.onError?.();
              setIsError(true);
            }}
          />
          {renderFooter(documentUrl, fciDownloadPath)}
        </>
      )}
      {isError && (
        <InfoScreenComponent
          image={renderInfoRasterImage(errorDetail)}
          title={I18n.t(
            "features.mvl.details.attachments.pdfPreview.errors.previewing.title"
          )}
          body={I18n.t(
            "features.mvl.details.attachments.pdfPreview.errors.previewing.body"
          )}
        />
      )}
    </>
  ) : (
    <ErrorComponent
      title={I18n.t("genericError")}
      subTitle={I18n.t("global.jserror.title")}
      onPress={() =>
        dispatch(fciDownloadPreviewClear({ path: fciDownloadPath }))
      }
      image={genericError}
      testID={"DocumentViewerErrorTestID"}
    />
  );
};
