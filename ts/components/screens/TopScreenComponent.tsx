import { Content } from "native-base";
import * as React from "react";

import { ComponentProps } from "../../types/react";
import BaseScreenComponent from "./BaseScreenComponent";
import { TopHeader } from "./TopHeader";

interface OwnProps {
  headerTitle?: string;
  hideHeader?: boolean;
  fixedHeader?: boolean;
}

type BaseScreenComponentProps =
  | "appLogo"
  | "goBack"
  | "contextualHelp"
  | "headerBody";

type Props = OwnProps &
  ComponentProps<typeof TopHeader> &
  Pick<ComponentProps<typeof BaseScreenComponent>, BaseScreenComponentProps>;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class TopScreenComponent extends React.PureComponent<Props> {
  private renderTopHeader() {
    const {
      hideHeader,
      icon,
      title,
      subtitle,
      onMoreLinkPress,
      banner
    } = this.props;

    return (
      !hideHeader && (
        <TopHeader
          icon={icon}
          title={title}
          subtitle={subtitle}
          onMoreLinkPress={onMoreLinkPress}
          banner={banner}
        />
      )
    );
  }

  public render() {
    const {
      appLogo,
      goBack,
      title,
      headerTitle,
      contextualHelp,
      headerBody,
      fixedHeader
    } = this.props;

    return (
      <BaseScreenComponent
        appLogo={appLogo}
        goBack={goBack}
        headerTitle={goBack ? headerTitle || title : undefined}
        contextualHelp={contextualHelp}
        headerBody={headerBody}
      >
        {fixedHeader ? (
          <React.Fragment>
            {this.renderTopHeader()}
            {this.props.children}
          </React.Fragment>
        ) : (
          <Content noPadded={true}>
            {this.renderTopHeader()}
            {this.props.children}
          </Content>
        )}
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
