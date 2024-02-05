import React, { useState } from "react";
import { StyleSheet } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import ReactNativeBlobUtil from "react-native-blob-util";
import Pdf from "react-native-pdf";
import * as S from "fp-ts/lib/string";
import {
  ButtonSolidProps,
  FooterWithButtons,
  IOColors
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { isIos } from "../../../utils/platform";
import { share } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import { FciDownloadPreviewDirectoryPath } from "../saga/networking/handleDownloadDocument";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { fciDownloadPreview } from "../store/actions";
import {
  fciDownloadPathSelector,
  fciDownloadPreviewSelector
} from "../store/reducers/fciDownloadPreview";
import LoadingComponent from "./LoadingComponent";

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

export const getFileNameFromUrl = (url: string) =>
  url.substring(url.lastIndexOf("/") + 1).split("?")[0] + ".pdf";

const renderFooter = (url: string, filePath: string) => {
  const confirmButtonProps: ButtonSolidProps = {
    onPress: () => ReactNativeBlobUtil.ios.presentOptionsMenu(filePath),
    label: I18n.t("messagePDFPreview.open"),
    accessibilityLabel: I18n.t("messagePDFPreview.open")
  };

  const shareButtonProps: ButtonSolidProps = {
    onPress: () => {
      share(
        `file://${
          FciDownloadPreviewDirectoryPath + "/" + getFileNameFromUrl(url)
        }`,
        undefined,
        false
      )().catch(_ => {
        showToast(I18n.t("messagePDFPreview.errors.sharing"));
      });
    },
    label: I18n.t("global.buttons.share"),
    accessibilityLabel: I18n.t("global.buttons.share")
  };

  const saveButtonProps: ButtonSolidProps = {
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
            I18n.t("messagePDFPreview.savedAtLocation", {
              name: "attachment.displayName"
            }),
            "success"
          );
        })
        .catch(_ => {
          showToast(I18n.t("messagePDFPreview.errors.saving"));
        });
    },
    label: I18n.t("messagePDFPreview.save"),
    accessibilityLabel: I18n.t("messagePDFPreview.save")
  };

  const openButtonProps: ButtonSolidProps = {
    onPress: () => {
      ReactNativeBlobUtil.android
        .actionViewIntent(
          FciDownloadPreviewDirectoryPath + "/" + getFileNameFromUrl(url),
          "application/pdf"
        )
        .catch(_ => {
          showToast(I18n.t("messagePDFPreview.errors.opening"));
        });
    },
    label: I18n.t("messagePDFPreview.open"),
    accessibilityLabel: I18n.t("messagePDFPreview.open")
  };

  return isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      primary={{ type: "Solid", buttonProps: confirmButtonProps }}
    />
  ) : (
    <FooterWithButtons
      type={"ThreeButtonsInLine"}
      primary={{
        type: "Solid",
        buttonProps: shareButtonProps
      }}
      secondary={{ type: "Outline", buttonProps: saveButtonProps }}
      third={{ type: "Outline", buttonProps: openButtonProps }}
    />
  );
};

type Props = {
  documentUrl: string;
  enableAnnotationRendering?: boolean;
  onLoadComplete?: (totalPages: number) => void;
  onPageChanged?: (page: number) => void;
  onError: () => void;
};

export const DocumentViewer = (props: Props): React.ReactElement => {
  const [isError, setIsError] = useState(false);
  const documentUrl = props.documentUrl;
  const enableAnnotationRendering = props.enableAnnotationRendering;
  const dispatch = useIODispatch();
  const fciDownloadSelector = useIOSelector(fciDownloadPreviewSelector);
  const fciDownloadPath = useIOSelector(fciDownloadPathSelector);

  React.useEffect(() => {
    dispatch(fciDownloadPreview.request({ url: documentUrl }));
  }, [documentUrl, dispatch]);

  if (pot.isLoading(fciDownloadSelector)) {
    return <LoadingComponent testID={"FciRouterLoadingScreenTestID"} />;
  }

  if (pot.isError(fciDownloadSelector) || isError) {
    props.onError();
  }

  return (
    <>
      {S.isEmpty(fciDownloadPath) === false && (
        <>
          <Pdf
            source={{ uri: fciDownloadPath, cache: true }}
            style={styles.pdf}
            onLoadComplete={props.onLoadComplete}
            onPageChanged={props.onPageChanged}
            onError={_ => {
              setIsError(true);
            }}
            enablePaging
            enableAnnotationRendering={enableAnnotationRendering ? true : false}
          />
          {renderFooter(documentUrl, fciDownloadPath)}
        </>
      )}
    </>
  );
};
