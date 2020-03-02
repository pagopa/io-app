/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */

import { Body, Container, Content, H1, Right } from "native-base";
import * as React from "react";
import { BackHandler, StyleSheet } from "react-native";

import IconFont from "../components/ui/IconFont";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import AppHeader from "./ui/AppHeader";

import themeVariables from "../theme/variables";

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

export class ContextualHelp extends React.Component<Props> {
  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPressed);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.handleBackPressed
    );
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
            <ButtonDefaultOpacity
              onPress={() => this.props.onClose()}
              transparent={true}
            >
              <IconFont name="io-close" />
            </ButtonDefaultOpacity>
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
