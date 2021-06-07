import { Toast, View } from "native-base";
import { useState } from "react";
import * as React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import ViewShot, { CaptureOptions } from "react-native-view-shot";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { MarkdownHandleCustomLink } from "../../components/MarkdownHandleCustomLink";
import { EdgeBorderComponent } from "../../../../components/screens/EdgeBorderComponent";
import { showToast } from "../../../../utils/showToast";
import { saveImageToGallery } from "../../../../utils/share";

type NavigationParams = Readonly<{
  markdownDetails: string;
}>;

const styles = StyleSheet.create({
  viewShot: {
    flex: 1,
    backgroundColor: "white"
  }
});

const showToastError = (error: string = I18n.t("global.genericError")) =>
  showToast(error);
const screenShotOption: CaptureOptions = { format: "jpg", quality: 1.0 };
export const EuCovidCertMarkdownDetailsScreen = (
  props: NavigationInjectedProps<NavigationParams>
): React.ReactElement => {
  const [loadComplete, setLoadComplete] = useState(false);
  const [isCapturingScreenShoot, setIsCapturingScreenShoot] = useState(false);
  const activateCTA = () => setLoadComplete(true);
  const screenShotRef = React.createRef<ViewShot>();
  React.useEffect(() => {
    if (isCapturingScreenShoot) {
      saveScreenShoot();
    }
  }, [isCapturingScreenShoot]);

  const saveScreenShoot = () => {
    const screenShot = screenShotRef.current;
    if (screenShot === null || screenShot.capture === undefined) {
      showToastError();
      setIsCapturingScreenShoot(false);
      return;
    }
    screenShot
      .capture()
      .then(screenShotUri => {
        saveImageToGallery(`file://${screenShotUri}`)
          .run()
          .then(maybeSaved => {
            maybeSaved.fold(
              () =>
                showToastError(
                  I18n.t("features.euCovidCertificate.save.noPermission")
                ),
              () => {
                Toast.show({
                  text: I18n.t("features.euCovidCertificate.save.ok")
                });
              }
            );
          })
          .catch(showToastError);
      })
      .catch(() => {
        showToastError();
      })
      .finally(() => {
        setIsCapturingScreenShoot(false);
      });
  };
  const onPressSaveImage = () => setIsCapturingScreenShoot(true);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.euCovidCertificate.valid.markdownDetails.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <ViewShot
        ref={screenShotRef}
        style={styles.viewShot}
        options={screenShotOption}
      >
        <SafeAreaView
          style={IOStyles.flex}
          testID={"EuCovidCertQrCodeFullScreen"}
        >
          <ScrollView style={IOStyles.horizontalContentPadding}>
            <MarkdownHandleCustomLink onLoadEnd={activateCTA}>
              {props.navigation.getParam("markdownDetails")}
            </MarkdownHandleCustomLink>
            <EdgeBorderComponent />
          </ScrollView>
          {!isCapturingScreenShoot && (
            <>
              {loadComplete && (
                <View style={{ marginBottom: -16 }}>
                  <FooterWithButtons
                    type={"SingleButton"}
                    leftButton={confirmButtonProps(
                      onPressSaveImage,
                      I18n.t(
                        "features.euCovidCertificate.valid.markdownDetails.save"
                      )
                    )}
                  />
                </View>
              )}
              <FooterWithButtons
                type={"SingleButton"}
                leftButton={cancelButtonProps(
                  () => props.navigation.goBack(),
                  I18n.t("global.buttons.close")
                )}
              />
            </>
          )}
        </SafeAreaView>
      </ViewShot>
    </BaseScreenComponent>
  );
};
