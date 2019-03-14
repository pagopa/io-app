import { Container } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ContextualHelp } from "../ContextualHelp";
import { BaseHeader } from "./BaseHeader";

import GoBackButton from "../GoBackButton";

interface ContextualHelpProps {
  title: string;
  body: () => React.ReactNode;
}

interface OwnProps {
  headerTitle?: string;
  goBack?: React.ComponentProps<typeof GoBackButton>["goBack"];
  contextualHelp?: ContextualHelpProps;
  primary?: boolean;
  headerBody?: React.ReactNode;
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
    const {
      primary,
      goBack,
      headerTitle,
      contextualHelp,
      headerBody
    } = this.props;
    return (
      <Container>
        <BaseHeader
          primary={primary}
          goBack={goBack}
          headerTitle={headerTitle}
          onShowHelp={contextualHelp ? this.showHelp : undefined}
          body={headerBody}
        />
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
