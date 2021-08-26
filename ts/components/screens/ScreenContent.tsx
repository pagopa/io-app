import { Content } from "native-base";
import * as React from "react";

import { StyleProp, ViewStyle } from "react-native";
import { NavigationEvents } from "react-navigation";
import { ComponentProps } from "../../types/react";
import { ScreenContentHeader } from "./ScreenContentHeader";

interface OwnProps {
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bounces?: boolean;
  contentRefreshControl?: ComponentProps<Content>["refreshControl"];
}

type Props = OwnProps & ComponentProps<typeof ScreenContentHeader>;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class ScreenContent extends React.PureComponent<Props> {
  private content = React.createRef<any>();
  private scrollTop = () => {
    if (this.content.current) {
      // eslint-disable-next-line no-underscore-dangle
      this.content.current._root.scrollToPosition(0, 0, false);
    }
  };

  public render() {
    const {
      title,
      icon,
      iconFont,
      subtitle,
      dark,
      hideHeader,
      contentStyle,
      bounces
    } = this.props;

    return (
      <Content
        ref={this.content}
        noPadded={true}
        style={contentStyle}
        bounces={bounces}
        refreshControl={this.props.contentRefreshControl}
      >
        <NavigationEvents onWillFocus={this.scrollTop} />
        {!hideHeader && (
          <ScreenContentHeader
            icon={icon}
            iconFont={iconFont}
            title={title}
            subtitle={subtitle}
            dark={dark}
          />
        )}
        {this.props.children}
      </Content>
    );
  }
}

export default ScreenContent;
