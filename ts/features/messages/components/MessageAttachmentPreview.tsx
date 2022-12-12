import * as pot from "@pagopa/ts-commons/lib/pot";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ReactNativeBlobUtil from "react-native-blob-util";
import Pdf from "react-native-pdf";
import image from "../../../../img/servicesStatus/error-detail-icon.png";
import { IOColors } from "../../../components/core/variables/IOColors";
import WorkunitGenericFailure from "../../../components/error/WorkunitGenericFailure";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import {
  Download,
  downloadFromAttachmentSelector
} from "../../../store/reducers/entities/messages/downloads";
import {
  UIAttachmentId,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { isIos } from "../../../utils/platform";
import { share } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import { confirmButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

const renderFooter = (
  { attachment, path }: Download,
  onShare?: () => void,
  onOpen?: () => void,
  onDownload?: () => void
) =>
  isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(() => {
        onShare?.();
        ReactNativeBlobUtil.ios.presentOptionsMenu(path);
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
          share(`file://${path}`, undefined, false)().catch(_ => {
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
            path
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
          .actionViewIntent(path, attachment.contentType)
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
  messageId: UIMessageId;
  attachmentId: UIAttachmentId;
  onLoadComplete?: () => void;
  onError?: () => void;
  onShare?: () => void;
  onOpen?: () => void;
  onDownload?: () => void;
};

export const MessageAttachmentPreview = (props: Props): React.ReactElement => {
  const [isError, setIsError] = useState(false);
  const messageId = props.messageId;
  const attachmentId = props.attachmentId;
  const downloadPot = useIOSelector(state =>
    downloadFromAttachmentSelector(state, { messageId, id: attachmentId })
  );
  const download = pot.toUndefined(downloadPot);

  return download ? (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.mvl.details.attachments.pdfPreview.title")}
    >
      <SafeAreaView style={styles.container} testID={"MvlDetailsScreen"}>
        {!isError && (
          <Pdf
            source={{ uri: download.path, cache: true }}
            style={styles.pdf}
            onLoadComplete={props.onLoadComplete}
            onError={_ => {
              props.onError?.();
              setIsError(true);
            }}
          />
        )}
        {isError && (
          <InfoScreenComponent
            image={renderInfoRasterImage(image)}
            title={I18n.t(
              "features.mvl.details.attachments.pdfPreview.errors.previewing.title"
            )}
            body={I18n.t(
              "features.mvl.details.attachments.pdfPreview.errors.previewing.body"
            )}
          />
        )}
        {renderFooter(download, props.onShare, props.onOpen, props.onDownload)}
      </SafeAreaView>
    </BaseScreenComponent>
  ) : (
    <WorkunitGenericFailure />
  );
};
