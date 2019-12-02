import { Container } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ContextualHelpModal } from "../ContextualHelpModal";
import { SearchType } from "../search/SearchButton";
import { BaseHeader } from "./BaseHeader";

interface ContextualHelpProps {
  title: string;
  body: () => React.ReactNode;
}

interface OwnProps {
  contextualHelp?: ContextualHelpProps;
  headerBody?: React.ReactNode;
  appLogo?: boolean;
  isSearchAvailable?: boolean;
  searchType?: SearchType;
}

type BaseHeaderProps =
  | "dark"
  | "appLogo"
  | "primary"
  | "goBack"
  | "headerTitle"
  | "onShowHelp"
  | "body"
  | "isSearchAvailable"
  | "searchType"
  | "customRightIcon";

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
      primary,
      isSearchAvailable,
      searchType,
      customRightIcon
    } = this.props;

    return (
      <Container>
        <BaseHeader
          primary={primary}
          dark={dark}
          goBack={goBack}
          headerTitle={headerTitle}
          onShowHelp={contextualHelp ? this.showHelp : undefined}
          isSearchAvailable={isSearchAvailable}
          searchType={searchType}
          body={headerBody}
          appLogo={appLogo}
          customRightIcon={customRightIcon}
        />
        {this.props.children}
        {contextualHelp && (
          <ContextualHelpModal
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
