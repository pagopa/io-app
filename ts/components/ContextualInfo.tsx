import { Body, Container, Content, Right } from "native-base";
import * as React from "react";
import { BackHandler, NativeEventSubscription, StyleSheet } from "react-native";
import I18n from "i18n-js";
import { IconButton } from "@pagopa/io-app-design-system";
import themeVariables from "../theme/variables";
import AppHeader from "./ui/AppHeader";
import { H1 } from "./core/typography/H1";

type Props = Readonly<{
  title: string;
  body: () => React.ReactNode;
  onClose: () => void;
}>;

const styles = StyleSheet.create({
  contentContainerStyle: {
    padding: themeVariables.contentPadding
  }
});

/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */
export default class ContextualInfo extends React.Component<Props> {
  private subscription: NativeEventSubscription | undefined;
  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPressed
    );
  }

  public componentWillUnmount() {
    this.subscription?.remove();
  }

  private handleBackPressed = () => {
    this.props.onClose();
    return true;
  };

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader noLeft={true}>
          <Body />
          <Right>
            <IconButton
              icon="closeLarge"
              color="neutral"
              onPress={() => this.props.onClose()}
              testID="contextualInfo_closeButton"
              accessibilityLabel={I18n.t("global.buttons.close")}
            />
          </Right>
        </AppHeader>
        <Content
          contentContainerStyle={styles.contentContainerStyle}
          noPadded={true}
        >
          <H1>{this.props.title}</H1>
          {this.props.body()}
        </Content>
      </Container>
    );
  }
}
