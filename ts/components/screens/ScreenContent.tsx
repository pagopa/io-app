import { Content } from "native-base";
import * as React from "react";

import { ComponentProps } from "../../types/react";
import { ScreenContentHeader } from "./ScreenContentHeader";

interface OwnProps {
  hideHeader?: boolean;
}

type Props = OwnProps & ComponentProps<typeof ScreenContentHeader>;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class ScreenContent extends React.PureComponent<Props> {
  public render() {
    const { title, icon, subtitle, banner, hideHeader } = this.props;

    return (
      <Content noPadded={true}>
        {!hideHeader && (
          <ScreenContentHeader
            icon={icon}
            title={title}
            subtitle={subtitle}
            banner={banner}
          />
        )}
        {this.props.children}
      </Content>
    );
  }
}

export default ScreenContent;
