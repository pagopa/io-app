/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */

import { Container, Content, H1, Right, View } from "native-base";
import * as React from "react";
import { InteractionManager, Modal, TouchableHighlight } from "react-native";

import IconFont from "../components/ui/IconFont";
import ActivityIndicator from "./ui/ActivityIndicator";
import AppHeader from "./ui/AppHeader";

import themeVariables from "../theme/variables";

type Props = Readonly<{
  title: string;
  body: () => React.ReactNode;
  isVisible: boolean;
  close: () => void;
}>;

type State = Readonly<{
  content: React.ReactNode | null;
}>;

export class ContextualHelp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      content: null
    };
  }

  public render(): React.ReactNode {
    // after the modal is fully visible, render the content -
    // in case of complex markdown this can take some time and we don't
    // want to impact the modal animation
    const onModalShow = () =>
      this.setState({
        content: this.props.body()
      });

    // on close, we set a handler to cleanup the content after all
    // interactions (animations) are complete
    const onClose = () => {
      InteractionManager.runAfterInteractions(() =>
        this.setState({
          content: null
        })
      );
      this.props.close();
    };

    return (
      <Modal
        visible={this.props.isVisible}
        onShow={onModalShow}
        animationType="slide"
        onRequestClose={onClose}
      >
        <Container>
          <AppHeader>
            <Right>
              <TouchableHighlight onPress={onClose}>
                <IconFont name="io-close" />
              </TouchableHighlight>
            </Right>
          </AppHeader>

          {!this.state.content && (
            <View centerJustified={true}>
              <ActivityIndicator color={themeVariables.brandPrimaryLight} />
            </View>
          )}
          {this.state.content && (
            <Content>
              <H1>{this.props.title}</H1>
              {this.state.content}
            </Content>
          )}
        </Container>
      </Modal>
    );
  }
}
