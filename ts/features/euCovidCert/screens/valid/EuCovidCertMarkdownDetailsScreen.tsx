import * as React from "react";
import { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { mixpanelTrack } from "../../../../mixpanel";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { showToast } from "../../../../utils/showToast";
import {
  FlashAnimatedComponent,
  FlashAnimationState
} from "../../components/FlashAnimatedComponent";
import { MarkdownHandleCustomLink } from "../../components/MarkdownHandleCustomLink";
import { EUCovidCertParamsList } from "../../navigation/params";
import { captureScreenshot, screenshotOptions } from "../../utils/screenshot";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { BaseDoubleButtonFooter } from "../BaseEuCovidCertificateLayout";

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

  const safeAreaInsets = useSafeAreaInsets();

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

  useHeaderSecondLevel({
    title: I18n.t(
      "features.euCovidCertificate.valid.markdownDetails.headerTitle"
    ),
    supportRequest: true
  });

  return (
    <>
      <ScrollView
        contentContainerStyle={{ paddingBottom: safeAreaInsets.bottom + 44 }}
        style={IOStyles.horizontalContentPadding}
      >
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
        <BaseDoubleButtonFooter
          onPressLeft={() => {
            void mixpanelTrack("EUCOVIDCERT_SAVE_MARKDOWN_DETAILS");
            setIsCapturingScreenShoot(true);
          }}
          onPressRight={() => props.navigation.goBack()}
          titleLeft={I18n.t(
            "features.euCovidCertificate.valid.markdownDetails.save"
          )}
          titleRight={I18n.t("global.buttons.close")}
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
