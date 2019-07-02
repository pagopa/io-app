import { Content } from "native-base";
import * as React from "react";

import { StyleProp, ViewStyle } from "react-native";
import { ComponentProps } from "../../types/react";
import { ScreenContentHeader } from "./ScreenContentHeader";

interface OwnProps {
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

type Props = OwnProps & ComponentProps<typeof ScreenContentHeader>;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class ScreenContent extends React.PureComponent<Props> {
  public render() {
    const {
      title,
      icon,
      subtitle,
      banner,
      dark,
      hideHeader,
      contentStyle
    } = this.props;

    return (
      <Content noPadded={true} style={contentStyle}>
        {!hideHeader && (
          <ScreenContentHeader
            icon={icon}
            title={title}
            subtitle={subtitle}
            banner={banner}
            dark={dark}
          />
        )}
        {this.props.children}
      </Content>
    );
  }
}

export default ScreenContent;
