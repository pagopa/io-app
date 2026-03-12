import {
  FooterActions,
  FooterActionsInline,
  IOColors,
  IOToast
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as S from "fp-ts/lib/string";
import { ComponentProps, ReactElement, useEffect, useState } from "react";

import { StyleSheet } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import Pdf from "react-native-pdf";
import I18n from "i18next";
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
  const shareButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["endAction"] = {
    label: I18n.t("global.buttons.share"),
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
    }
  };

  const saveButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["startAction"] = {
    label: I18n.t("messagePDFPreview.save"),
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
    }
  };

  return isIos ? (
    <FooterActions
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("messagePDFPreview.open"),
          onPress: () => ReactNativeBlobUtil.ios.presentOptionsMenu(filePath)
        }
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
          {/** Be aware that, in react-native-pdf 6.7.7, on Android, there
           * is a bug where onLoadComplete callback is not called. So,
           * if you have to use such callback, you should rely upon
           * onPageChanged, which is called to report that the first page
           * has loaded */}
          <Pdf
            source={{ uri: fciDownloadPath, cache: true }}
            style={styles.pdf}
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
