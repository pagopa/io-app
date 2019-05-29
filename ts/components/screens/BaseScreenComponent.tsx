import { Container, View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ContextualHelp } from "../ContextualHelp";
import { BaseHeader } from "./BaseHeader";

interface ContextualHelpProps {
  title: string;
  body: () => React.ReactNode;
}

interface OwnProps {
  contextualHelp?: ContextualHelpProps;
  headerBody?: React.ReactNode;
  appLogo?: boolean;
  dark?: boolean;
}

type BaseHeaderProps = "dark" | "appLogo" | "primary" | "goBack" | "headerTitle";

type Props = OwnProps &
  Pick<React.ComponentProps<typeof BaseHeader>, BaseHeaderProps>;

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
    const {
      dark,
      appLogo,
      contextualHelp,
      goBack,
      headerBody,
      headerTitle,
      primary
    } = this.props;
    return (
      <Container>
        <BaseHeader
          primary={primary}
          dark={dark}
          goBack={goBack}
          headerTitle={headerTitle}
          onShowHelp={contextualHelp ? this.showHelp : undefined}
          body={headerBody}
          appLogo={appLogo}
        />

        <View style={{zIndex: -100}}>
          {this.props.children}
        </View>
        
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
