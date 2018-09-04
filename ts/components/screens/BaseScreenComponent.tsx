import { Body, Container, Left, Right, Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { TouchableHighlight } from "react-native";

import IconFont from "../../components/ui/IconFont";
import AppHeader from "../ui/AppHeader";

import { DEFAULT_APPLICATION_NAME } from "../../config";
import { ContextualHelp } from "../ContextualHelp";
import GoBackButton from "../GoBackButton";

interface ContextualHelpProps {
  title: string;
  body: () => React.ReactNode;
}

export interface OwnProps {
  headerTitle?: string;
  goBack?: () => void;
  contextualHelp?: ContextualHelpProps;
  primary?: boolean;
}

type Props = OwnProps;

interface State {
  isHelpVisible: boolean;
}

class BaseScreenComponent extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isHelpVisible: false
    };
  }

  private showHelp = () => {
    this.setState({ isHelpVisible: true });
  };

  private hideHelp = () => {
    this.setState({ isHelpVisible: false });
  };

  public render() {
    const { goBack, headerTitle, contextualHelp } = this.props;
    return (
      <Container>
        <AppHeader primary={this.props.primary}>
          {goBack && (
            <Left>
              <GoBackButton onPress={goBack} />
            </Left>
          )}
          <Body>
            <Text white={this.props.primary}>
              {headerTitle || DEFAULT_APPLICATION_NAME}
            </Text>
          </Body>
          <Right>
            {contextualHelp && (
              <TouchableHighlight onPress={this.showHelp}>
                <IconFont name="io-question" />
              </TouchableHighlight>
            )}
          </Right>
        </AppHeader>
        {this.props.children}
        {contextualHelp && (
          <ContextualHelp
            title={contextualHelp.title}
            body={contextualHelp.body}
            isVisible={this.state.isHelpVisible}
            close={this.hideHelp}
          />
        )}
      </Container>
    );
  }
}

export default connectStyle(
  "UIComponent.BaseScreenComponent",
  {},
  mapPropsToStyleNames
)(BaseScreenComponent);
