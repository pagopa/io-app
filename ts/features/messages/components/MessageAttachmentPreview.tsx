import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Pdf from "react-native-pdf";
import ReactNativeBlobUtil from "react-native-blob-util";
import * as pot from "italia-ts-commons/lib/pot";
import customVariables from "../../../theme/variables";
import {
  mvlAttachmentDownloadFromIdSelector,
  MvlDownload
} from "../../mvl/store/reducers/downloads";
import { isIos } from "../../../utils/platform";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../i18n";
import { share } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import { MvlAttachmentId } from "../../mvl/types/mvlData";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import WorkunitGenericFailure from "../../../components/error/WorkunitGenericFailure";
import { mvlRemoveCachedAttachment } from "../../mvl/store/actions/downloads";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  pdf: {
    flex: 1,
    backgroundColor: customVariables.brandDarkGray
  }
});

const renderFooter = ({ attachment, path }: MvlDownload) =>
  isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(() => {
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
          share(`file://${path}`, undefined, false)
            .run()
            .catch(_ => {
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
  attachmentId: MvlAttachmentId;
};

export const MessageAttachmentPreview = (props: Props): React.ReactElement => {
  const dispatch = useIODispatch();
  const attachmentId = props.attachmentId;
  const downloadPot = useIOSelector(state =>
    mvlAttachmentDownloadFromIdSelector(state, attachmentId)
  );
  const download = pot.toUndefined(downloadPot);
  return download ? (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.mvl.details.attachments.pdfPreview.title")}
    >
      <SafeAreaView style={styles.container} testID={"MvlDetailsScreen"}>
        <Pdf
          source={{ uri: download.path, cache: true }}
          style={styles.pdf}
          onError={_ => {
            showToast(
              I18n.t(
                "features.mvl.details.attachments.bottomSheet.failing.details"
              )
            );
            dispatch(
              mvlRemoveCachedAttachment({
                id: download.attachment.id,
                path: download.path
              })
            );
          }}
        />
        {renderFooter(download)}
      </SafeAreaView>
    </BaseScreenComponent>
  ) : (
    <WorkunitGenericFailure />
  );
};
