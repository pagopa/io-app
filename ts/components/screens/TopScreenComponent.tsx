import I18n from "i18n-js";
import { H1, Text, View } from "native-base";
import * as React from "react";
import { ImageSourcePropType } from "react-native";

import variables from "../../theme/variables";
import ScreenHeader from "../ScreenHeader";
import BaseScreenComponent, {
  OwnProps as BaseScreenComponentProps
} from "./BaseScreenComponent";

const defaultStyle = {
  subheaderContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding,
    paddingBottom: variables.spacerLargeHeight
  }
};

interface OwnProps {
  title: string;
  icon?: ImageSourcePropType;
  subtitle?: string;
  headerTitle?: string;
  onMoreLinkPress?: () => void;
  banner?: React.ReactNode;
}

type Props = OwnProps &
  Pick<BaseScreenComponentProps, "goBack" | "contextualHelp">;

/**
 * Wraps a BaseScreenComponent with a title and a subtitle
 */
class TopScreenComponent extends React.PureComponent<Props> {
  public render() {
    const styles = defaultStyle;

    const {
      goBack,
      icon,
      title,
      subtitle,
      headerTitle,
      onMoreLinkPress,
      contextualHelp,
      banner
    } = this.props;
    return (
      <BaseScreenComponent
        goBack={goBack}
        headerTitle={goBack ? headerTitle || title : undefined}
        contextualHelp={contextualHelp}
      >
        {banner && (
          <React.Fragment>
            {banner}
            <View spacer={true} />
          </React.Fragment>
        )}
        <ScreenHeader heading={<H1>{title}</H1>} icon={icon} />
        <View style={styles.subheaderContainer}>
          {subtitle && <Text>{subtitle}</Text>}
          {onMoreLinkPress && (
            <Text link={true} onPress={onMoreLinkPress}>
              {I18n.t("preferences.moreLinkText")}
            </Text>
          )}
        </View>
        {this.props.children}
      </BaseScreenComponent>
    );
  }
}

export default TopScreenComponent;
