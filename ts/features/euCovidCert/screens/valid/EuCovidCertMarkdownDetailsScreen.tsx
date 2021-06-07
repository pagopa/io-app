import { Toast, View } from "native-base";
import { useState } from "react";
import * as React from "react";
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { CaptureOptions } from "react-native-view-shot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { cancelButtonProps } from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { MarkdownHandleCustomLink } from "../../components/MarkdownHandleCustomLink";
import { showToast } from "../../../../utils/showToast";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../components/core/typography/Label";
import { captureScreenShoot } from "../../utils/screenshoot";

type NavigationParams = Readonly<{
  markdownDetails: string;
}>;

const styles = StyleSheet.create({
  viewShot: {
    flex: 1,
    backgroundColor: "white"
  },
  save: {
    width: "100%"
  },
  hover: {
    minWidth: "100%",
    minHeight: "100%",
    bottom: 0,
    left: 0,
    top: 0,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  }
});

const showToastError = (error: string = I18n.t("global.genericError")) =>
  showToast(error);
const screenShotOption: CaptureOptions = {
  width: Dimensions.get("window").width,
  format: "jpg",
  quality: 1.0
};
const flashAnimation = 240 as Millisecond;

export const EuCovidCertMarkdownDetailsScreen = (
  props: NavigationInjectedProps<NavigationParams>
): React.ReactElement => {
  const [loadMarkdownComplete, setLoadMarkdownComplete] = useState(false);
  const [isCapturingScreenShoot, setIsCapturingScreenShoot] = useState(false);
  const backgroundAnimation = React.useRef(new Animated.Value(0)).current;
  const backgroundInterpolation = backgroundAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0)", "rgba(255,255,255,1)"]
  });
  const screenShotViewContainerRef = React.createRef<View>();

  React.useEffect(() => {
    if (isCapturingScreenShoot) {
      fadeIn();
    }
  }, [isCapturingScreenShoot]);

  const fadeOut = () =>
    Animated.timing(backgroundAnimation, {
      duration: flashAnimation,
      toValue: 0,
      useNativeDriver: false,
      easing: Easing.cubic
    }).start();

  const fadeIn = () =>
    Animated.timing(backgroundAnimation, {
      duration: flashAnimation,
      toValue: 1,
      useNativeDriver: false,
      easing: Easing.cubic
    }).start(saveScreenShoot);

  const saveScreenShoot = () => {
    // it should not never happen
    if (screenShotViewContainerRef.current === null) {
      showToastError();
      setIsCapturingScreenShoot(false);
      return;
    }
    captureScreenShoot(
      screenShotViewContainerRef,
      screenShotOption,
      () =>
        Toast.show({
          text: I18n.t("features.euCovidCertificate.save.ok")
        }),
      undefined,
      () => {
        setIsCapturingScreenShoot(false);
        fadeOut();
      }
    );
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
            {isCapturingScreenShoot && <View large={true} spacer={true} />}
            <MarkdownHandleCustomLink
              extraBodyHeight={60}
              onLoadEnd={() => setLoadMarkdownComplete(true)}
            >
              {props.navigation.getParam("markdownDetails")}
            </MarkdownHandleCustomLink>
            {canShowButton && (
              <>
                <View spacer={true} />
                <ButtonDefaultOpacity
                  style={styles.save}
                  onPress={() => setIsCapturingScreenShoot(true)}
                >
                  <Label color={"white"}>
                    {I18n.t(
                      "features.euCovidCertificate.valid.markdownDetails.save"
                    )}
                  </Label>
                </ButtonDefaultOpacity>
                <View spacer={true} />
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

      {/* an overlay animated view. it is used when screenshot is captured, to simulate flash effect */}
      <Animated.View
        pointerEvents={"none"}
        style={[styles.hover, { backgroundColor: backgroundInterpolation }]}
      />
    </BaseScreenComponent>
  );
};
