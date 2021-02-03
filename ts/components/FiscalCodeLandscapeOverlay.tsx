/**
 * A component to show the fiscal code fac-simile in Landscape
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Body, Button, Container, View } from "native-base";
import * as React from "react";
import {
  BackHandler,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet
} from "react-native";
import { isIphoneX } from "react-native-iphone-x-helper";
import { InitializedProfile } from "../../definitions/backend/InitializedProfile";
import { Municipality } from "../../definitions/content/Municipality";
import IconFont from "../components/ui/IconFont";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import { getBrightness, setBrightness } from "../utils/brightness";
import FiscalCodeComponent from "./FiscalCodeComponent";
import AppHeader from "./ui/AppHeader";

export type Props = Readonly<{
  onCancel: () => void;
  profile: InitializedProfile;
  municipality: pot.Pot<Municipality, Error>;
  showBackSide?: boolean;
}>;

const globalHeaderHeight: number = Platform.select({
  ios: customVariables.appHeaderHeight + (isIphoneX() ? 42 : 18),
  android: customVariables.appHeaderHeight,
  default: -1
});

const styles = StyleSheet.create({
  content: {
    backgroundColor: customVariables.brandDarkGray,
    paddingHorizontal: customVariables.contentPadding,
    marginTop: -customVariables.appHeaderHeight,
    paddingTop: 0
  },

  headerSpacer: {
    height: customVariables.appHeaderHeight
  },

  closeButton: {
    position: "absolute",
    right: customVariables.contentPadding,
    top: globalHeaderHeight - customVariables.appHeaderHeight
  }
});

const HIGH_BRIGHTNESS = 1.0; // Target screen brightness for a very bright screen

const FiscalCodeLandscapeOverlay: React.FunctionComponent<Props> = (
  props: Props
) => {
  // eslint-disable-next-line functional/no-let
  let scrollTimeout: number | undefined;

  const ScrollViewRef = React.createRef<ScrollView>();

  const handleBackPress = () => {
    // On backpress the component gets unmounted, so the brightness is restored by the
    // cleanup function
    props.onCancel();
    return true;
  };

  const scrollToEnd = () => {
    if (props.showBackSide && ScrollViewRef.current) {
      // dalay the scroll to end command to wait until the ingress animation is completed
      // eslint-disable-next-line
      scrollTimeout = setTimeout(() => {
        if (ScrollViewRef.current) {
          ScrollViewRef.current.scrollToEnd({ animated: true });
        }
      }, 300);
    }
  };

  React.useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
      // if there is an active timeout, clear it!
      if (scrollTimeout !== undefined) {
        clearTimeout(scrollTimeout);
        // eslint-disable-next-line
        scrollTimeout = undefined;
      }
    };
  }, []);

  // Brightness effect manager
  React.useEffect(() => {
    // eslint-disable-next-line functional/no-let
    let myBrightness: number | undefined;

    const myBrightF = async () => {
      myBrightness = await getBrightness()
        .fold(
          () => undefined,
          _ => _
        )
        .run();
    };

    const mySetBrightF = async () => {
      await myBrightF();
      if (myBrightness) {
        await setBrightness(HIGH_BRIGHTNESS).run();
      }
    };

    const finishedSet = mySetBrightF();

    return () => {
      const restoreDeviceBrightnessF = async () => {
        await finishedSet;
        if (myBrightness) {
          await setBrightness(myBrightness)
            .fold(
              () => undefined,
              _ => _
            )
            .run();
        }
      };
      void restoreDeviceBrightnessF();
    };
  }, []);

  return (
    <Container style={{ backgroundColor: customVariables.brandDarkGray }}>
      <AppHeader noLeft={true} dark={true}>
        <Body />
      </AppHeader>
      <StatusBar
        backgroundColor={customVariables.brandDarkGray}
        barStyle={"light-content"}
      />
      <ScrollView
        style={styles.content}
        ref={ScrollViewRef}
        onLayout={scrollToEnd}
      >
        <View style={styles.headerSpacer} />
        <View spacer={true} />
        <View>
          <FiscalCodeComponent
            type={"Landscape"}
            profile={props.profile}
            getBackSide={false}
            municipality={props.municipality}
          />
        </View>

        <View spacer={true} />

        <FiscalCodeComponent
          type={"Landscape"}
          profile={props.profile}
          getBackSide={true}
          municipality={props.municipality}
        />

        <View spacer={true} large={true} />
        <View spacer={true} large={true} />
      </ScrollView>
      <View style={styles.closeButton}>
        <Button
          transparent={true}
          onPress={props.onCancel}
          accessible={true}
          accessibilityRole={"button"}
          accessibilityLabel={I18n.t("global.buttons.close")}
        >
          <IconFont name="io-close" color={customVariables.colorWhite} />
        </Button>
      </View>
    </Container>
  );
};

export default FiscalCodeLandscapeOverlay;
