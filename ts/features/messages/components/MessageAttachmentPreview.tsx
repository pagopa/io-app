import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import image from "../../../../img/servicesStatus/error-detail-icon.png";
import { H2 } from "../../../components/core/typography/H2";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import PdfViewer from "../../../components/messages/MessageDetail/PdfViewer";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment
} from "../../../store/actions/messages";
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
  onPDFError?: () => void;
  onShare?: () => void;
  onOpen?: () => void;
  onDownload?: () => void;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  loadingBody: {
    marginTop: variables.spacerExtralargeWidth,
    textAlign: "center"
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
    <H2 style={styles.loadingBody}>
      {I18n.t("features.messages.loading.subtitle")}
    </H2>
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
  downloadPath: string,
  isGenericAttachment: boolean,
  isPDFError: boolean,
  props: Props,
  onPDFLoadingError: () => void
) => (
  <>
    {isPDFError ? (
      renderError(
        I18n.t("messagePDFPreview.errors.previewing.title"),
        I18n.t("messagePDFPreview.errors.previewing.body")
      )
    ) : (
      <PdfViewer
        downloadPath={downloadPath}
        onError={onPDFLoadingError}
        onLoadComplete={props.onLoadComplete}
      />
    )}
    {renderFooter(
      props.attachment,
      downloadPath,
      isGenericAttachment,
      props.onShare,
      props.onOpen,
      props.onDownload
    )}
  </>
);

const renderFooter = (
  attachment: UIAttachment,
  downloadPath: string,
  isGenericAttachment: boolean,
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
      }, I18n.t(isGenericAttachment ? "messagePDFPreview.open" : "messagePDFPreview.singleBtn"))}
    />
  ) : (
    <FooterWithButtons
      type={"ThreeButtonsInLine"}
      leftButton={{
        bordered: true,
        primary: false,
        buttonFontSize: variables.btnSmallFontSize,
        onPress: () => {
          onShare?.();
          share(`file://${downloadPath}`, undefined, false)().catch(_ => {
            showToast(I18n.t("messagePDFPreview.errors.sharing"));
          });
        },
        title: I18n.t("global.buttons.share")
      }}
      midButton={{
        bordered: true,
        primary: false,
        buttonFontSize: variables.btnSmallFontSize,
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
                I18n.t("messagePDFPreview.savedAtLocation", {
                  name: attachment.displayName
                }),
                "success"
              );
            })
            .catch(_ => {
              showToast(I18n.t("messagePDFPreview.errors.saving"));
            });
        },
        title: I18n.t("messagePDFPreview.save")
      }}
      rightButton={confirmButtonProps(
        () => {
          onOpen?.();
          ReactNativeBlobUtil.android
            .actionViewIntent(downloadPath, attachment.contentType)
            .catch(_ => {
              showToast(I18n.t("messagePDFPreview.errors.opening"));
            });
        },
        I18n.t("messagePDFPreview.open"),
        undefined,
        undefined,
        undefined,
        variables.btnSmallFontSize
      )}
    />
  );

export const MessageAttachmentPreview = (props: Props): React.ReactElement => {
  const dispatch = useIODispatch();
  const [isPDFError, setIsPDFError] = useState(false);
  const isFirstRendering = useRef(true);
  // This ref is needed otherwise the auto back on the useEffect will fire multiple
  // times, since its dependencies change during the back navigation
  const autoBackOnErrorHandled = useRef(false);
  const navigation = useNavigation();
  const messageId = props.messageId;
  const attachment = props.attachment;
  const attachmentId = attachment.id;
  const downloadPot = useIOSelector(state =>
    downloadPotForMessageAttachmentSelector(state, {
      messageId,
      id: attachmentId
    })
  );
  // This component handles the attachment blob download only if
  // it is a generic attachment (not a PN one, since that flow
  // has already downloaded the attachmnet before navigating to
  // this screen), upon first rendering and only if no attachment
  // blob data is present or if there was a previous error in
  // downloading the data
  const isGenericAttachment = attachment.category === "GENERIC";
  const shouldDownloadAttachment =
    isGenericAttachment &&
    isFirstRendering.current &&
    (isStrictNone(downloadPot) || pot.isError(downloadPot));

  const onPDFError = props.onPDFError;
  const internalOnPDFError = useCallback(() => {
    setIsPDFError(true);
    onPDFError?.();
  }, [onPDFError]);

  // The go-back callback has to be customized since, for a general
  // attachment, we are handling the download request from this
  // component and thus, it has to be cancelled if the user chooses
  // not to wait for it to finish (but only for generic attachments,
  // since PN attachments are downloaded before entering this component)
  const customGoBack = useCallback(() => {
    if (
      isGenericAttachment &&
      (pot.isLoading(downloadPot) || pot.isUpdating(downloadPot))
    ) {
      dispatch(cancelPreviousAttachmentDownload());
    }
    // eslint-disable-next-line functional/immutable-data
    autoBackOnErrorHandled.current = true;
    navigation.goBack();
  }, [downloadPot, dispatch, isGenericAttachment, navigation]);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isFirstRendering.current = false;
    if (shouldDownloadAttachment) {
      dispatch(downloadAttachment.request(attachment));
    } else if (
      !autoBackOnErrorHandled.current &&
      isGenericAttachment &&
      pot.isError(downloadPot)
    ) {
      // eslint-disable-next-line functional/immutable-data
      autoBackOnErrorHandled.current = true;
      const error = downloadPot.error;
      showToast(error.message);
      navigation.goBack();
    }
  }, [
    attachment,
    downloadPot,
    dispatch,
    isGenericAttachment,
    navigation,
    shouldDownloadAttachment
  ]);

  const shouldDisplayDownloadProgress = pot.isLoading(downloadPot);
  const shouldDisplayPDFPreview =
    pot.isSome(downloadPot) && !pot.isError(downloadPot);
  return (
    <BaseScreenComponent
      goBack={customGoBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("messagePDFPreview.title")}
    >
      <SafeAreaView
        style={styles.container}
        testID={"message-attachment-preview"}
      >
        {shouldDisplayDownloadProgress && renderDownloadFeedback()}
        {shouldDisplayPDFPreview &&
          renderPDF(
            downloadPot.value.path,
            isGenericAttachment,
            isPDFError,
            props,
            internalOnPDFError
          )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
