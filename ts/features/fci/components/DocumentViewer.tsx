import {
  ButtonOutline,
  ButtonSolidProps,
  FooterActions,
  FooterActionsInline,
  IOColors,
  IOToast
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as S from "fp-ts/lib/string";
import { ReactElement, useEffect, useState } from "react";

import { StyleSheet } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import Pdf from "react-native-pdf";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { isIos } from "../../../utils/platform";
import { share } from "../../../utils/share";
import { FciDownloadPreviewDirectoryPath } from "../saga/networking/handleDownloadDocument";
import { fciDownloadPreview } from "../store/actions";
import {
  fciDownloadPathSelector,
  fciDownloadPreviewSelector
} from "../store/reducers/fciDownloadPreview";
import LoadingComponent from "./LoadingComponent";

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors["grey-700"]
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
        IOToast.error(I18n.t("messagePDFPreview.errors.sharing"));
      });
    },
    label: I18n.t("global.buttons.share"),
    accessibilityLabel: I18n.t("global.buttons.share")
  };

  const saveButtonProps: ButtonOutline = {
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
          IOToast.success(
            I18n.t("messagePDFPreview.savedAtLocation", {
              name: "attachment.displayName"
            })
          );
        })
        .catch(_ => {
          IOToast.error(I18n.t("messagePDFPreview.errors.saving"));
        });
    },
    label: I18n.t("messagePDFPreview.save"),
    accessibilityLabel: I18n.t("messagePDFPreview.save")
  };

  return isIos ? (
    <FooterActions
      actions={{
        type: "SingleButton",
        primary: confirmButtonProps
      }}
    />
  ) : (
    <FooterActionsInline
      startAction={saveButtonProps}
      endAction={shareButtonProps}
    />
  );
};

type Props = {
  documentUrl: string;
  onLoadComplete?: (totalPages: number) => void;
  onPageChanged?: (page: number) => void;
  onError: () => void;
};

export const DocumentViewer = (props: Props): ReactElement => {
  const [isError, setIsError] = useState(false);
  const documentUrl = props.documentUrl;
  const dispatch = useIODispatch();
  const fciDownloadSelector = useIOSelector(fciDownloadPreviewSelector);
  const fciDownloadPath = useIOSelector(fciDownloadPathSelector);

  useEffect(() => {
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
          />
          {renderFooter(documentUrl, fciDownloadPath)}
        </>
      )}
    </>
  );
};
