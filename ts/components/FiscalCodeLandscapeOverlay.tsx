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
import { useNavigationContext } from "../utils/hooks/useOnFocus";
import FiscalCodeComponent from "./FiscalCodeComponent";
import AppHeader from "./ui/AppHeader";

type Props = Readonly<{
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

 
/*
  // Set and unset brightness effect manager

/*
  // Add and remove EventListener effect manager
  useEffect(() => {
    // Using willFocus listener would be less responsive
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    const didBlurSubscription = navigation.addListener("didBlur", () =>
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress)
    );

    return () => {
      didBlurSubscription.remove();
      alert("BACK PRESS CLEANUP");
    };
  }, [navigation]);
*/


const FiscalCodeLandscapeOverlay: React.FunctionComponent<Props> = (props: Props) => {

  const [initialBrightness, storeInitialBrightness] = React.useState(0.0);
  const navigation = useNavigationContext();


  // Store the device brightness value before navigating to this screen
  const getAndStoreDeviceBrightnessTask = getBrightness().fold(
    () => alert("Failed to get Device Brightness"),
    (brightness) => storeInitialBrightness(brightness)
  );

  const setHighDeviceBrightnessTask = setBrightness(HIGH_BRIGHTNESS).fold(
    () => alert("Failed to set High Screen Brightness"),
    () => undefined
  );

  const restoreDeviceBrightnessTask = setBrightness(initialBrightness).fold(
    () => alert("Failed to restore screen brightness."),
    () => undefined
  );

  const getAndStoreDeviceBrightness = async () =>
    await getAndStoreDeviceBrightnessTask.run();

  const restoreDeviceBrightness = async () =>
    await restoreDeviceBrightnessTask.run();

  const setHighDeviceBrightness = async () =>
    await setHighDeviceBrightnessTask.run();

  


  // eslint-disable-next-line functional/no-let
  let scrollTimeout: number | undefined;

  const ScrollVewRef = React.createRef<ScrollView>();
  
  const handleBackPress = () => {
    props.onCancel();
    return true;
  };

  const scrollToEnd = () => {
    if (props.showBackSide && ScrollVewRef.current) {
      // dalay the scroll to end command to wait until the ingress animation is completed
      // eslint-disable-next-line
      scrollTimeout = setTimeout(() => {
        if (ScrollVewRef.current) {
          ScrollVewRef.current.scrollToEnd({ animated: true });
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

  React.useLayoutEffect(() => {
    void getAndStoreDeviceBrightness();  
    // Now can restore brightness, let's rise it
    void setHighDeviceBrightness();

    return () => {
      void restoreDeviceBrightness();
    };
  }, []); 

  return (<Container style={{ backgroundColor: customVariables.brandDarkGray }}>
    <AppHeader noLeft={true} dark={true}>
      <Body />
    </AppHeader>
    <StatusBar
      backgroundColor={customVariables.brandDarkGray}
      barStyle={"light-content"}
    />
    <ScrollView
      style={styles.content}
      ref={ScrollVewRef}
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
  </Container>);
};
/*
export default class FiscalCodeLandscapeOverlay extends React.PureComponent<
  Props
> {
  private scrollTimeout?: number;
  private ScrollVewRef = React.createRef<ScrollView>();

  private handleBackPress = () => {
    this.props.onCancel();
    return true;
  };    

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    // if there is an active timeout, clear it!
    if (this.scrollTimeout !== undefined) {
      clearTimeout(this.scrollTimeout);
      // eslint-disable-next-line
      this.scrollTimeout = undefined;
    }
  }

  private scrollToEnd = () => {
    if (this.props.showBackSide && this.ScrollVewRef.current) {
      // dalay the scroll to end command to wait until the ingress animation is completed
      // eslint-disable-next-line
      this.scrollTimeout = setTimeout(() => {
        if (this.ScrollVewRef.current) {
          this.ScrollVewRef.current.scrollToEnd({ animated: true });
        }
      }, 300);
    }
  };

  public render() {
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
          ref={this.ScrollVewRef}
          onLayout={this.scrollToEnd}
        >
          <View style={styles.headerSpacer} />
          <View spacer={true} />
          <View>
            <FiscalCodeComponent
              type={"Landscape"}
              profile={this.props.profile}
              getBackSide={false}
              municipality={this.props.municipality}
            />
          </View>

          <View spacer={true} />

          <FiscalCodeComponent
            type={"Landscape"}
            profile={this.props.profile}
            getBackSide={true}
            municipality={this.props.municipality}
          />

          <View spacer={true} large={true} />
          <View spacer={true} large={true} />
        </ScrollView>
        <View style={styles.closeButton}>
          <Button
            transparent={true}
            onPress={this.props.onCancel}
            accessible={true}
            accessibilityRole={"button"}
            accessibilityLabel={I18n.t("global.buttons.close")}
          >
            <IconFont name="io-close" color={customVariables.colorWhite} />
          </Button>
        </View>
      </Container>
    );
  }
}
*/

export default FiscalCodeLandscapeOverlay;
