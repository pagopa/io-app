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
