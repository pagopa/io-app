import {
  FooterWithButtons,
  IOColors,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
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
  }
});

const showToastError = (error: string = I18n.t("global.genericError")) =>
  IOToast.error(error);

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
        IOToast.success(I18n.t("features.euCovidCertificate.save.ok")),
      onNoPermissions: () =>
        IOToast.info(I18n.t("features.euCovidCertificate.save.noPermission")),
      onError: () => IOToast.error(I18n.t("global.genericError")),
      onEnd: () => {
        setFlashAnimationState("fadeOut");
        setIsCapturingScreenShoot(false);
      }
    });
  };
  // show button when markdown is loaded and it is not capturing the screenshot
  const canShowButton = !isCapturingScreenShoot && loadMarkdownComplete;

  useHeaderSecondLevel({
    title: I18n.t(
      "features.euCovidCertificate.valid.markdownDetails.headerTitle"
    ),
    supportRequest: true
  });

  return (
    <>
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
        </View>
      </ScrollView>
      {canShowButton && (
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("global.buttons.close"),
              onPress: () => props.navigation.goBack()
            }
          }}
          secondary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t(
                "features.euCovidCertificate.valid.markdownDetails.save"
              ),
              onPress: () => {
                void mixpanelTrack("EUCOVIDCERT_SAVE_MARKDOWN_DETAILS");
                setIsCapturingScreenShoot(true);
              }
            }
          }}
        />
      )}
      {/* this view must be the last one, since it must be drawn on top of all */}
      <FlashAnimatedComponent
        state={flashAnimationState}
        onFadeInCompleted={saveScreenShoot}
      />
    </>
  );
};
