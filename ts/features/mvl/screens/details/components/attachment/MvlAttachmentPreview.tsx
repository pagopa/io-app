import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Pdf from "react-native-pdf";
import ReactNativeBlobUtil from "react-native-blob-util";
import { CompatNavigationProp } from "@react-navigation/compat";
import * as pot from "italia-ts-commons/lib/pot";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import customVariables from "../../../../../../theme/variables";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { isIos } from "../../../../../../utils/platform";
import { showToast } from "../../../../../../utils/showToast";
import I18n from "../../../../../../i18n";
import { MvlAttachmentId } from "../../../../types/mvlData";
import { share } from "../../../../../../utils/share";
import { IOStackNavigationProp } from "../../../../../../navigation/params/AppParamsList";
import { MvlParamsList } from "../../../../navigation/params";
import { mvlRemoveCachedAttachment } from "../../../../store/actions/downloads";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import {
  mvlAttachmentDownloadFromIdSelector,
  MvlDownload
} from "../../../../store/reducers/downloads";

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

export type MvlAttachmentPreviewNavigationParams = Readonly<{
  attachmentId: MvlAttachmentId;
}>;

type Props = {
  navigation: CompatNavigationProp<
    IOStackNavigationProp<MvlParamsList, "MVL_ATTACHMENT">
  >;
};

export const MvlAttachmentPreview = (props: Props): React.ReactElement => {
  const dispatch = useIODispatch();
  const attachmentId = props.navigation.getParam("attachmentId");
  const downloadPot = useIOSelector(state =>
    mvlAttachmentDownloadFromIdSelector(state, attachmentId)
  );
  const download = pot.toUndefined(downloadPot);
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.mvl.details.attachments.pdfPreview.title")}
    >
      {download && (
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
      )}
    </BaseScreenComponent>
  );
};
