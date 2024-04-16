import {
  ButtonOutline,
  ButtonSolid,
  ContentWrapper,
  HSpacer,
  IOToast
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import image from "../../../../../img/servicesStatus/error-detail-icon.png";
import { H2 } from "../../../../components/core/typography/H2";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import variables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isIos } from "../../../../utils/platform";
import { isStrictNone } from "../../../../utils/pot";
import { share } from "../../../../utils/share";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment
} from "../../store/actions";
import { downloadPotForMessageAttachmentSelector } from "../../store/reducers/downloads";
import {
  attachmentContentType,
  attachmentDisplayName
} from "../../store/reducers/transformers";
import { UIMessageId } from "../../types";
import LegacyPdfViewer from "./LegacyPdfViewer";

type Props = {
  messageId: UIMessageId;
  attachment: ThirdPartyAttachment;
  enableDownloadAttachment?: boolean;
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
  name: string,
  mimeType: string,
  downloadPath: string,
  isPDFError: boolean,
  props: Omit<
    Props,
    "enableDownloadAttachment" | "attachment" | "messageId" | "onPDFError"
  >,
  onPDFLoadingError: () => void
) => (
  <>
    {isPDFError ? (
      renderError(
        I18n.t("messagePDFPreview.errors.previewing.title"),
        I18n.t("messagePDFPreview.errors.previewing.body")
      )
    ) : (
      <LegacyPdfViewer
        downloadPath={downloadPath}
        onError={onPDFLoadingError}
        onLoadComplete={props.onLoadComplete}
      />
    )}
    {renderFooter(
      name,
      mimeType,
      downloadPath,
      props.onShare,
      props.onOpen,
      props.onDownload
    )}
  </>
);

const renderFooter = (
  name: string,
  mimeType: string,
  downloadPath: string,
  onShare?: () => void,
  onOpen?: () => void,
  onDownload?: () => void
) =>
  isIos ? (
    <ContentWrapper>
      <View style={{ paddingTop: 16 }}>
        <ButtonSolid
          fullWidth
          onPress={() => {
            onShare?.();
            ReactNativeBlobUtil.ios.presentOptionsMenu(downloadPath);
          }}
          label={I18n.t("messagePDFPreview.singleBtn")}
        />
      </View>
    </ContentWrapper>
  ) : (
    <ContentWrapper>
      <View
        style={{
          flexDirection: "row",
          paddingTop: 16
        }}
      >
        <View style={{ flexGrow: 1 }}>
          <ButtonOutline
            fullWidth
            onPress={() => {
              onShare?.();
              share(`file://${downloadPath}`, undefined, false)().catch(_ => {
                IOToast.error(I18n.t("messagePDFPreview.errors.sharing"));
              });
            }}
            label={I18n.t("global.buttons.share")}
          />
        </View>
        <HSpacer size={16} />
        <View style={{ flexGrow: 1 }}>
          <ButtonOutline
            fullWidth
            onPress={() => {
              onDownload?.();
              ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
                {
                  name,
                  parentFolder: "",
                  mimeType
                },
                "Download",
                downloadPath
              )
                .then(_ => {
                  IOToast.success(
                    I18n.t("messagePDFPreview.savedAtLocation", {
                      name
                    })
                  );
                })
                .catch(_ => {
                  IOToast.error(I18n.t("messagePDFPreview.errors.saving"));
                });
            }}
            label={I18n.t("messagePDFPreview.save")}
          />
        </View>
        <HSpacer size={16} />
        <View style={{ flexGrow: 1 }}>
          <ButtonSolid
            fullWidth
            onPress={() => {
              onOpen?.();
              ReactNativeBlobUtil.android
                .actionViewIntent(downloadPath, mimeType)
                .catch(_ => {
                  IOToast.error(I18n.t("messagePDFPreview.errors.opening"));
                });
            }}
            label={I18n.t("messagePDFPreview.open")}
          />
        </View>
      </View>
    </ContentWrapper>
  );

export const LegacyMessageAttachmentPreview = ({
  enableDownloadAttachment = true,
  ...props
}: Props): React.ReactElement => {
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
    downloadPotForMessageAttachmentSelector(state, messageId, attachmentId)
  );
  // This component handles the attachment blob download only if
  // it is a generic attachment (not a PN one, since that flow
  // has already downloaded the attachmnet before navigating to
  // this screen), upon first rendering and only if no attachment
  // blob data is present or if there was a previous error in
  // downloading the data
  const shouldDownloadAttachment =
    enableDownloadAttachment &&
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
      enableDownloadAttachment &&
      (pot.isLoading(downloadPot) || pot.isUpdating(downloadPot))
    ) {
      dispatch(cancelPreviousAttachmentDownload());
    }
    // eslint-disable-next-line functional/immutable-data
    autoBackOnErrorHandled.current = true;
    navigation.goBack();
  }, [downloadPot, dispatch, enableDownloadAttachment, navigation]);

  useEffect(() => {
    // eslint-disable-next-line functional/immutable-data
    isFirstRendering.current = false;
    if (shouldDownloadAttachment) {
      dispatch(
        downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      );
    } else if (
      !autoBackOnErrorHandled.current &&
      enableDownloadAttachment &&
      pot.isError(downloadPot)
    ) {
      // eslint-disable-next-line functional/immutable-data
      autoBackOnErrorHandled.current = true;
      const error = downloadPot.error;
      IOToast.error(error.message);
      navigation.goBack();
    }
  }, [
    attachment,
    downloadPot,
    dispatch,
    enableDownloadAttachment,
    messageId,
    navigation,
    shouldDownloadAttachment
  ]);

  const shouldDisplayDownloadProgress = pot.isLoading(downloadPot);
  const shouldDisplayPDFPreview =
    pot.isSome(downloadPot) && !pot.isError(downloadPot);

  const name = attachmentDisplayName(attachment);
  const mimeType = attachmentContentType(attachment);

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
            name,
            mimeType,
            downloadPot.value.path,
            isPDFError,
            props,
            internalOnPDFError
          )}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
