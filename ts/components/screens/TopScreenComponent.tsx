import { Content } from "native-base";
import * as React from "react";

import { ComponentProps } from "../../types/react";
import BaseScreenComponent from "./BaseScreenComponent";
import { TopHeader } from "./TopHeader";

interface OwnProps {
  headerTitle?: string;
  hideHeader?: boolean;
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
  public render() {
    const {
      appLogo,
      goBack,
      icon,
      title,
      subtitle,
      headerTitle,
      onMoreLinkPress,
      contextualHelp,
      banner,
      headerBody,
      hideHeader
    } = this.props;
    return (
      <BaseScreenComponent
        appLogo={appLogo}
        goBack={goBack}
        headerTitle={goBack ? headerTitle || title : undefined}
        contextualHelp={contextualHelp}
        headerBody={headerBody}
      >
        <Content noPadded={true}>
          {!hideHeader && (
            <TopHeader
              icon={icon}
              title={title}
              subtitle={subtitle}
              onMoreLinkPress={onMoreLinkPress}
              banner={banner}
            />
          )}
          {this.props.children}
        </Content>
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
