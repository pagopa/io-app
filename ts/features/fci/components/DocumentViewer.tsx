import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import * as pot from "@pagopa/ts-commons/lib/pot";
import ReactNativeBlobUtil from "react-native-blob-util";
import Pdf from "react-native-pdf";
import * as S from "fp-ts/lib/string";
import image from "../../../../img/servicesStatus/error-detail-icon.png";
import { IOColors } from "../../../components/core/variables/IOColors";
import WorkunitGenericFailure from "../../../components/error/WorkunitGenericFailure";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import IconFont from "../../../components/ui/IconFont";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { isIos } from "../../../utils/platform";
import { share } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import { confirmButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { fciDownloadPreview, fciDownloadPreviewCancel } from "../store/actions";
import {
  fciDownloadPathSelector,
  fciDownloadPreviewSelector
} from "../store/reducers/fciDownloadPreview";
import { LoadingErrorComponent } from "../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

const getFileNameFromUrl = (url: string) =>
  url.substring(url.lastIndexOf("/") + 1);

const renderFooter = (url: string, filePath: string) =>
  isIos ? (
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={confirmButtonProps(() => {
        ReactNativeBlobUtil.ios.presentOptionsMenu(filePath);
      }, I18n.t("features.mvl.details.attachments.pdfPreview.singleBtn"))}
    />
  ) : (
    <FooterWithButtons
      type={"ThreeButtonsInLine"}
      leftButton={{
        bordered: true,
        primary: false,
        onPress: () => {
          share(`${url}`, undefined, false)().catch(_ => {
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
              name: getFileNameFromUrl(url)
            },
            "Download",
            url
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
          .actionViewIntent(url, "application/pdf")
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
  onLoadComplete?: () => void;
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
  const navigation = useNavigation();
  const fciDownloadSelector = useIOSelector(fciDownloadPreviewSelector);
  const fciDownloadPath = useIOSelector(fciDownloadPathSelector);

  React.useEffect(() => {
    dispatch(fciDownloadPreview.request({ url: documentUrl }));
  }, [documentUrl, dispatch]);

  if (pot.isLoading(fciDownloadSelector)) {
    return <LoadingComponent />;
  }

  const customGoBack: React.ReactElement = (
    <TouchableDefaultOpacity
      onPress={() => {
        dispatch(fciDownloadPreviewCancel({ path: fciDownloadPath }));
        navigation.goBack();
      }}
      accessible={true}
      accessibilityLabel={I18n.t("global.buttons.back")}
      accessibilityRole={"button"}
    >
      <IconFont name={"io-back"} style={{ color: IOColors.bluegrey }} />
    </TouchableDefaultOpacity>
  );

  return !pot.isError(fciDownloadSelector) ? (
    <BaseScreenComponent
      goBack={true}
      customGoBack={customGoBack}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("features.mvl.details.attachments.pdfPreview.title")}
    >
      <SafeAreaView
        style={styles.container}
        testID={"FciDocumentPreviewScreenTestID"}
      >
        {S.isEmpty(fciDownloadPath) === false && (
          <>
            <Pdf
              source={{ uri: fciDownloadPath, cache: true }}
              style={styles.pdf}
              onLoadComplete={props.onLoadComplete}
              onError={_ => {
                setIsError(true);
              }}
            />
            {renderFooter(documentUrl, fciDownloadPath)}
          </>
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
      </SafeAreaView>
    </BaseScreenComponent>
  ) : (
    <WorkunitGenericFailure />
  );
};
