import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import Pdf from "react-native-pdf";
import image from "../../../../img/servicesStatus/error-detail-icon.png";
import { Body } from "../../../components/core/typography/Body";
import { IOColors } from "../../../components/core/variables/IOColors";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { downloadAttachment } from "../../../store/actions/messages";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { downloadPotForMessageAttachmentSelector } from "../../../store/reducers/entities/messages/downloads";
import {
  UIAttachment,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import variables from "../../../theme/variables";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { isIos } from "../../../utils/platform";
import { isStrictNone } from "../../../utils/pot";
import { share } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import { confirmButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";

type Props = {
  messageId: UIMessageId;
  attachment: UIAttachment;
  onLoadComplete?: () => void;
  onError?: () => void;
  onShare?: () => void;
  onOpen?: () => void;
  onDownload?: () => void;
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  },
  loadingBody: {
    marginTop: variables.spacerLargeHeight
  }
});

const renderDownloadFeedback = () => (
  <>
    <ActivityIndicator
      size={"large"}
      accessible={true}
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      importantForAccessibility={"no-hide-descendants"}
    />
    <Body style={styles.loadingBody}>
      {I18n.t("features.messages.loading.subtitle")}
    </Body>
  </>
);

const renderError = (title: string, body: string) => (
  <InfoScreenComponent
    image={renderInfoRasterImage(image)}
    title={title}
    body={body}
  />
);

const renderPDF = (
  isPDFError: boolean,
  downloadPath: string,
  props: Props,
  onPDFError: () => void
) => (
  <>
    {isPDFError ? (
      renderError(
        I18n.t(
          "features.mvl.details.attachments.pdfPreview.errors.previewing.title"
        ),
        I18n.t(
          "features.mvl.details.attachments.pdfPreview.errors.previewing.body"
        )
      )
    ) : (
      <Pdf
        source={{ uri: downloadPath, cache: true }}
        style={styles.pdf}
        onLoadComplete={props.onLoadComplete}
        onError={onPDFError}
      />
    )}
    {renderFooter(
      props.attachment,
      downloadPath,
      props.onShare,
      props.onOpen,
      props.onDownload
    )}
  </>
);

const renderFooter = (
  attachment: UIAttachment,
  downloadPath: string,
  onShare?: () => void,
  onOpen?: () => void,
  onDownload?: () => void
) =>
  isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(() => {
        onShare?.();
        ReactNativeBlobUtil.ios.presentOptionsMenu(downloadPath);
      }, I18n.t("features.mvl.details.attachments.pdfPreview.singleBtn"))}
    />
  ) : (
    <FooterWithButtons
      type={"ThreeButtonsInLine"}
      leftButton={{
        bordered: true,
        primary: false,
        onPress: () => {
          onShare?.();
          share(`file://${downloadPath}`, undefined, false)().catch(_ => {
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
          onDownload?.();
          ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: attachment.displayName,
              parentFolder: "",
              mimeType: attachment.contentType
            },
            "Download",
            downloadPath
          )
            .then(_ => {
              showToast(
                I18n.t(
                  "features.mvl.details.attachments.pdfPreview.savedAtLocation",
                  {
                    name: attachment.displayName
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
        onOpen?.();
        ReactNativeBlobUtil.android
          .actionViewIntent(downloadPath, attachment.contentType)
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

export const MessageAttachmentPreview = (props: Props): React.ReactElement => {
  const ioDispatch = useIODispatch();
  const [isPDFError, setIsPDFError] = useState(false);
  const messageId = props.messageId;
  const attachment = props.attachment;
  const attachmentId = attachment.id;
  const downloadPot = useIOSelector(state =>
    downloadPotForMessageAttachmentSelector(state, {
      messageId,
      id: attachmentId
    })
  );
  const isGenericAttachment = attachment.category === "GENERIC";
  const shouldDownloadAttachment =
    isGenericAttachment && isStrictNone(downloadPot);

  const onError = props.onError;
  const onPDFError = useCallback(() => {
    setIsPDFError(true);
    onError?.();
  }, [onError]);

  useEffect(() => {
    if (shouldDownloadAttachment) {
      ioDispatch(downloadAttachment.request(attachment));
    }
  }, [attachment, ioDispatch, shouldDownloadAttachment]);

  const shouldDisplayDownloadError = pot.isError(downloadPot);
  const shouldDisplayDownloadProgress = pot.isLoading(downloadPot);
  const shouldDisplayPDFPreview = pot.isSome(downloadPot);
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.mvl.details.attachments.pdfPreview.title")}
    >
      <SafeAreaView
        style={styles.container}
        testID={"message-attachment-preview"}
      >
        {shouldDisplayDownloadError &&
          renderError(
            I18n.t("global.jserror.title"),
            I18n.t(
              "features.mvl.details.attachments.bottomSheet.failing.details"
            )
          )}
        {shouldDisplayDownloadProgress && renderDownloadFeedback()}
        {shouldDisplayPDFPreview &&
          renderPDF(isPDFError, downloadPot.value.path, props, onPDFError)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
