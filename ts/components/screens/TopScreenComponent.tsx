import * as React from "react";

import { ComponentProps } from "../../types/react";

import BaseScreenComponent from "./BaseScreenComponent";
import { TopHeader } from "./TopHeader";

interface OwnProps {
  headerTitle?: string;
  hideHeader?: boolean;
}

type Props = OwnProps &
  ComponentProps<typeof TopHeader> &
  Pick<
    ComponentProps<typeof BaseScreenComponent>,
    "goBack" | "contextualHelp" | "headerBody"
  >;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class TopScreenComponent extends React.PureComponent<Props> {
  public render() {
    const {
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
        goBack={goBack}
        headerTitle={goBack ? headerTitle || title : undefined}
        contextualHelp={contextualHelp}
        headerBody={headerBody}
      >
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
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
