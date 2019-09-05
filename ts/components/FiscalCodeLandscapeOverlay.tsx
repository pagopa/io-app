/**
 * A component to show the fiscal code fac-simile in Landscape
 */
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
import { UserProfile } from "../../definitions/backend/UserProfile";
import IconFont from "../components/ui/IconFont";
import { MunicipalityState } from "../store/reducers/content";
import customVariables from "../theme/variables";
import FiscalCodeComponent from "./FiscalCodeComponent";
import AppHeader from "./ui/AppHeader";

type Props = Readonly<{
  onCancel: () => void;
  profile: UserProfile;
  municipality: MunicipalityState;
  showBackSide?: boolean;
}>;

const globalHeaderHeight: number = Platform.select({
  ios: customVariables.appHeaderHeight + (isIphoneX() ? 42 : 18),
  android: customVariables.appHeaderHeight
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
  private scrollViewHeight: number = 0;
  private ScrollVewRef = React.createRef<ScrollView>();

  private handleBackPress = () => {
    this.props.onCancel();
    return true;
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    if (this.props.showBackSide) {
      setTimeout(() => {
        if (this.ScrollVewRef.current) {
          this.ScrollVewRef.current.scrollTo({
            y: this.scrollViewHeight,
            animated: true
          });
        }
      }, 100);
    }
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

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
          onContentSizeChange={(_, height) => {
            this.scrollViewHeight = height; // tslint:disable-line no-object-mutation
          }}
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
          <Button transparent={true} onPress={() => this.props.onCancel()}>
            <IconFont name="io-close" color={customVariables.colorWhite} />
          </Button>
        </View>
      </Container>
    );
  }
}
