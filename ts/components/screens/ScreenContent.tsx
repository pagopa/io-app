import { Content } from "native-base";
import * as React from "react";

import { StyleProp, ViewStyle } from "react-native";
import { ComponentProps } from "../../types/react";
import { ScreenContentHeader } from "./ScreenContentHeader";

interface OwnProps {
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  bounces?: boolean;
  contentRefreshControl?: ComponentProps<Content>["refreshControl"];
  referenceToContentScreen?: (
    c: ScreenContentRoot
  ) => ScreenContentRoot | React.LegacyRef<Content>;
}

export type ScreenContentRoot = {
  _root: ScreenContentFunctions;
};

type ScreenContentFunctions = {
  scrollToPosition: (x: number, y: number) => void;
};

type Props = OwnProps & ComponentProps<typeof ScreenContentHeader>;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class ScreenContent extends React.PureComponent<Props> {
  public render() {
    const {
      title,
      rasterIcon,
      icon,
      subtitle,
      dark,
      hideHeader,
      contentStyle,
      bounces,
      referenceToContentScreen
    } = this.props;

    return (
      <Content
        ref={referenceToContentScreen as unknown as React.LegacyRef<Content>}
        noPadded={true}
        style={contentStyle}
        bounces={bounces}
        refreshControl={this.props.contentRefreshControl}
      >
        {!hideHeader && (
          <ScreenContentHeader
            rasterIcon={rasterIcon}
            icon={icon}
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
