/**
 * A component to show the fiscal code fac-simile in Landscape
 */
import { Body, Button, Container, Content, View } from "native-base";
import * as React from "react";
import { Platform, StatusBar, StyleSheet } from "react-native";
import { isIphoneX } from "react-native-iphone-x-helper";
import { UserProfile } from "../../definitions/backend/UserProfile";
import IconFont from "../components/ui/IconFont";
import customVariables from "../theme/variables";
import FiscalCodeComponent from "./FiscalCodeComponent";
import AppHeader from "./ui/AppHeader";

type Props = Readonly<{
  onCancel: () => void;
  profile: UserProfile;
  showBackSide?: boolean;
}>;

const globalHeaderHeight: number =
  Platform.OS === "ios"
    ? isIphoneX()
      ? customVariables.appHeaderHeight + 42
      : customVariables.appHeaderHeight + 18
    : customVariables.appHeaderHeight;

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
  // private contentRef: any;

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
        <Content
          style={styles.content}
          // tslint:disable-next-line no-object-mutation
        >
          <View style={styles.headerSpacer} />
          <View spacer={true} />
          <View>
            <FiscalCodeComponent
              type={"Landscape"}
              profile={this.props.profile}
              getBackSide={false}
            />
          </View>

          <View spacer={true} />

          <FiscalCodeComponent
            type={"Landscape"}
            profile={this.props.profile}
            getBackSide={true}
          />

          <View spacer={true} large={true} />
          <View spacer={true} large={true} />
        </Content>
        <View style={styles.closeButton}>
          <Button transparent={true} onPress={() => this.props.onCancel()}>
            <IconFont name="io-close" color={customVariables.colorWhite} />
          </Button>
        </View>
      </Container>
    );
  }
}
