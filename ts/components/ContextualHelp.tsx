/**
 * This component shows a contextual help
 * that provides additional information when
 * needed (e.g. ToS, explaining why fees are
 * needed)
 */

import { Container, Content, H1, Right } from "native-base";
import * as React from "react";
import { InteractionManager, Modal, TouchableHighlight } from "react-native";

import IconFont from "../components/ui/IconFont";
import AppHeader from "./ui/AppHeader";

type Props = Readonly<{
  title: string;
  body: React.ReactNode;
  isVisible: boolean;
  close: () => void;
}>;

type State = Readonly<{
  isOpen: boolean;
}>;

export class ContextualHelp extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  // after the modal is fully visible, render the content -
  // in case of complex markdown this can take some time and we don't
  // want to impact the modal animation
  public onModalShow = () => {
    this.setState({
      isOpen: true
    });
  };

  // on close, we set a handler to cleanup the content after all
  // interactions (animations) are complete
  public onClose = () => {
    InteractionManager.runAfterInteractions(() =>
      this.setState({
        isOpen: false
      })
    );
    this.props.close();
  };

  public render(): React.ReactNode {
    return (
      <Modal
        visible={this.props.isVisible}
        onShow={this.onModalShow}
        animationType="slide"
        onRequestClose={this.onClose}
      >
        <Container>
          <AppHeader>
            <Right>
              <TouchableHighlight onPress={this.onClose}>
                <IconFont name="io-close" />
              </TouchableHighlight>
            </Right>
          </AppHeader>

          {this.state.isOpen && (
            <Content>
              <H1>{this.props.title}</H1>
              {this.props.body}
            </Content>
          )}
        </Container>
      </Modal>
    );
  }
}
