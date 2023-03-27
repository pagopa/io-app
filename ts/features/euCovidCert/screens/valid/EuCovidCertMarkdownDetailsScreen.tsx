import * as React from "react";
import { useState } from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Label } from "../../../../components/core/typography/Label";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../utils/showToast";
import { cancelButtonProps } from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import {
  FlashAnimatedComponent,
  FlashAnimationState
} from "../../components/FlashAnimatedComponent";
import { MarkdownHandleCustomLink } from "../../components/MarkdownHandleCustomLink";
import { EUCovidCertParamsList } from "../../navigation/params";
import { captureScreenshot, screenshotOptions } from "../../utils/screenshot";

export type EuCovidCertMarkdownDetailsScreenNavigationParams = Readonly<{
  markdownDetails: string;
}>;

const styles = StyleSheet.create({
  viewShot: {
    flex: 1,
    backgroundColor: IOColors.white
  },
  save: {
    width: "100%"
  }
});

const showToastError = (error: string = I18n.t("global.genericError")) =>
  showToast(error);

export const EuCovidCertMarkdownDetailsScreen = (
  props: IOStackNavigationRouteProps<
    EUCovidCertParamsList,
    "EUCOVIDCERT_MARKDOWN_DETAILS"
  >
): React.ReactElement => {
  const [loadMarkdownComplete, setLoadMarkdownComplete] = useState(false);
  const [isCapturingScreenShoot, setIsCapturingScreenShoot] = useState(false);
  const [flashAnimationState, setFlashAnimationState] =
    useState<FlashAnimationState>();
  const screenShotViewContainerRef = React.createRef<View>();

  React.useEffect(() => {
    if (isCapturingScreenShoot) {
      // at the end of fadeIn animation, the views inside screenShotViewContainerRef
      // will be captured in an screenshot image
      setFlashAnimationState("fadeIn");
    }
  }, [isCapturingScreenShoot]);

  const saveScreenShoot = () => {
    // it should not never happen
    if (screenShotViewContainerRef.current === null) {
      showToastError();
      setIsCapturingScreenShoot(false);
      return;
    }
    captureScreenshot(screenShotViewContainerRef, screenshotOptions, {
      onSuccess: () =>
        showToast(I18n.t("features.euCovidCertificate.save.ok"), "success"),
      onNoPermissions: () =>
        showToast(I18n.t("features.euCovidCertificate.save.noPermission")),
      onError: () => showToast(I18n.t("global.genericError")),
      onEnd: () => {
        setFlashAnimationState("fadeOut");
        setIsCapturingScreenShoot(false);
      }
    });
  };
  // show button when markdown is loaded and it is not capturing the screenshot
  const canShowButton = !isCapturingScreenShoot && loadMarkdownComplete;
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t(
        "features.euCovidCertificate.valid.markdownDetails.headerTitle"
      )}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"EuCovidCertQrCodeFullScreen"}
      >
        <ScrollView style={IOStyles.horizontalContentPadding}>
          {/* add an extra padding while capturing the screenshot */}
          <View
            collapsable={false}
            ref={screenShotViewContainerRef}
            style={[
              styles.viewShot,
              isCapturingScreenShoot
                ? IOStyles.horizontalContentPadding
                : undefined
            ]}
          >
            {/* add an extra top and bottom (as extra height in the markdown component)
            margin while capturing the screenshot  */}
            {isCapturingScreenShoot && <VSpacer size={24} />}
            <MarkdownHandleCustomLink
              extraBodyHeight={60}
              onLoadEnd={() => setLoadMarkdownComplete(true)}
            >
              {props.route.params.markdownDetails}
            </MarkdownHandleCustomLink>
            {canShowButton && (
              <>
                <VSpacer size={16} />
                <ButtonDefaultOpacity
                  style={styles.save}
                  onPress={() => {
                    void mixpanelTrack("EUCOVIDCERT_SAVE_MARKDOWN_DETAILS");
                    setIsCapturingScreenShoot(true);
                  }}
                >
                  <Label color={"white"}>
                    {I18n.t(
                      "features.euCovidCertificate.valid.markdownDetails.save"
                    )}
                  </Label>
                </ButtonDefaultOpacity>
                <VSpacer size={16} />
              </>
            )}
          </View>
        </ScrollView>
        {canShowButton && (
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={cancelButtonProps(
              () => props.navigation.goBack(),
              I18n.t("global.buttons.close")
            )}
          />
        )}
      </SafeAreaView>
      {/* this view must be the last one, since it must be drawn on top of all */}
      <FlashAnimatedComponent
        state={flashAnimationState}
        onFadeInCompleted={saveScreenShoot}
      />
    </BaseScreenComponent>
  );
};
