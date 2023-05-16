import { ListItem } from "native-base";
import * as React from "react";
import {
  Text,
  View,
  AccessibilityRole,
  StyleProp,
  StyleSheet,
  ViewStyle,
  AccessibilityState
} from "react-native";
import Switch from "../../components/ui/Switch";
import customVariables from "../../theme/variables";
import { makeFontStyleObject } from "../core/fonts";
import { IOBadge } from "../core/IOBadge";
import { HSpacer } from "../core/spacer/Spacer";
import { Body } from "../core/typography/Body";
import { IOColors } from "../core/variables/IOColors";
import { IOIcons, Icon } from "../core/icons";
import { IOStyles } from "../core/variables/IOStyles";
import { BadgeComponent } from "./BadgeComponent";

type Props = Readonly<{
  title: string;
  titleBadge?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  subTitle?: string;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  hasBadge?: boolean;
  iconName?: IOIcons;
  smallIconSize?: boolean;
  iconOnTop?: boolean;
  iconSize?: number;
  hideIcon?: boolean;
  paddingRightDescription?: number;
  useExtendedSubTitle?: boolean;
  style?: StyleProp<ViewStyle>;
  hideSeparator?: boolean;
  isItemDisabled?: boolean;
  onSwitchValueChanged?: (value: boolean) => void;
  switchValue?: boolean;
  switchDisabled?: boolean;
  keySwitch?: string;
  isLongPressEnabled?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  testID?: string;
}>;
const DEFAULT_ICON_SIZE = 24;
const PADDING_R_DESCRIPTION = 24;

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
    borderBottomColor: customVariables.itemSeparator
  },
  listItemText: {
    fontSize: 18,
    lineHeight: 24,
    ...makeFontStyleObject("SemiBold", undefined, "TitilliumWeb")
  },
  spacingBase: {
    paddingTop: 6,
    paddingRight: customVariables.spacingBase
  },
  flexRow2: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 1
  },
  flexColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1
  },
  alignToStart: {
    alignSelf: "flex-start"
  }
});

export default class ListItemComponent extends React.Component<Props> {
  public render() {
    const ICON_SIZE = this.props.iconSize || DEFAULT_ICON_SIZE;
    const showDefaultIcon =
      this.props.iconName === undefined && this.props.hideIcon !== true;
    return (
      <ListItem
        style={[styles.listItem, IOStyles.rowSpaceBetween, this.props.style]}
        onPress={this.props.onPress}
        onLongPress={this.props.onLongPress}
        first={this.props.isFirstItem}
        last={this.props.isLastItem || this.props.hideSeparator}
        accessibilityLabel={this.props.accessibilityLabel}
        accessibilityState={this.props.accessibilityState}
        accessibilityRole={this.props.accessibilityRole}
        testID={this.props.testID}
      >
        <View style={styles.flexColumn}>
          <View style={IOStyles.rowSpaceBetween}>
            <View style={styles.flexRow2}>
              {this.props.hasBadge && (
                <View style={styles.spacingBase}>
                  <BadgeComponent />
                </View>
              )}

              <Text
                style={[
                  styles.listItemText,
                  {
                    color: this.props.isItemDisabled
                      ? IOColors.grey
                      : IOColors.bluegreyDark
                  }
                ]}
                numberOfLines={2}
              >
                {this.props.title}
              </Text>
              <HSpacer size={16} />

              {this.props.titleBadge && (
                <View style={{ marginTop: 4 }}>
                  {/* Use marginTop to align the badge
                  to the text. TODO: Replace it with a
                  more robust approach. */}
                  <IOBadge
                    small
                    text={this.props.titleBadge}
                    variant="solid"
                    color="blue"
                  />
                  <HSpacer size={4} />
                </View>
              )}
            </View>
            {showDefaultIcon &&
              (this.props.isLongPressEnabled ? (
                <Switch
                  key={this.props.keySwitch}
                  value={this.props.switchValue}
                  onValueChange={this.props.onSwitchValueChanged}
                  disabled={this.props.switchDisabled}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              ) : (
                <Icon
                  name="chevronRightListItem"
                  size={ICON_SIZE}
                  color="blue"
                />
              ))}
          </View>
          {this.props.subTitle && (
            <Body
              numberOfLines={this.props.useExtendedSubTitle ? undefined : 1}
              style={[
                { alignSelf: "flex-start" },
                {
                  paddingRight:
                    this.props.paddingRightDescription || PADDING_R_DESCRIPTION
                }
              ]}
            >
              {this.props.subTitle}
            </Body>
          )}
        </View>
        {this.props.iconName !== undefined && this.props.hideIcon !== true && (
          <View style={this.props.iconOnTop && styles.alignToStart}>
            <Icon
              name={this.props.iconName}
              size={this.props.smallIconSize ? ICON_SIZE : ICON_SIZE * 2}
              color="blue"
            />
          </View>
        )}
      </ListItem>
    );
  }
}
