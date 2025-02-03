import {
  Badge,
  Body,
  Divider,
  HSpacer,
  Icon,
  IOColors,
  IOIcons,
  IOIconSizeScale,
  NativeSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Component } from "react";
import {
  AccessibilityRole,
  AccessibilityState,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import customVariables from "../../theme/variables";
import { makeFontStyleObject } from "../core/fonts";
import { IOStyles } from "../core/variables/IOStyles";

type Props = Readonly<{
  title: string;
  titleBadge?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  subTitle?: string;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  iconName?: IOIcons;
  smallIconSize?: boolean;
  iconOnTop?: boolean;
  iconSize?: IOIconSizeScale;
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
const ICON_SIZE_DEFAULT: IOIconSizeScale = 24;
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
    ...makeFontStyleObject("Semibold", undefined, "TitilliumSansPro")
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

/**
 *
 * @deprecated It should be more appropriate to use a proper list item or just let the Flatlist handle the rendering.
 */
export default class ListItemComponent extends Component<Props> {
  public render() {
    const ICON_SIZE: IOIconSizeScale = this.props.iconSize
      ? this.props.iconSize
      : ICON_SIZE_DEFAULT;
    const showDefaultIcon =
      this.props.iconName === undefined && this.props.hideIcon !== true;
    return (
      <>
        <VSpacer size={16} />
        <Pressable
          style={[styles.listItem, IOStyles.rowSpaceBetween, this.props.style]}
          onPress={this.props.onPress}
          onLongPress={this.props.onLongPress}
          accessibilityLabel={this.props.accessibilityLabel}
          accessibilityState={this.props.accessibilityState}
          accessibilityRole={this.props.accessibilityRole}
          testID={this.props.testID}
        >
          <View style={styles.flexColumn}>
            <View style={IOStyles.rowSpaceBetween}>
              <View style={styles.flexRow2}>
                <Text
                  style={[
                    styles.listItemText,
                    {
                      color: this.props.isItemDisabled
                        ? IOColors["grey-450"]
                        : IOColors["grey-850"]
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
                    <Badge variant="default" text={this.props.titleBadge} />
                    <HSpacer size={4} />
                  </View>
                )}
              </View>
              {showDefaultIcon &&
                (this.props.isLongPressEnabled ? (
                  <NativeSwitch
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
                    color="blueIO-500"
                  />
                ))}
            </View>
            {this.props.subTitle && (
              <View
                style={{
                  alignSelf: "flex-start",
                  paddingRight:
                    this.props.paddingRightDescription || PADDING_R_DESCRIPTION
                }}
              >
                <Body
                  numberOfLines={this.props.useExtendedSubTitle ? undefined : 1}
                >
                  {this.props.subTitle}
                </Body>
              </View>
            )}
          </View>
          {this.props.iconName !== undefined &&
            this.props.hideIcon !== true && (
              <View style={this.props.iconOnTop && styles.alignToStart}>
                <Icon
                  name={this.props.iconName}
                  size={
                    this.props.smallIconSize ? ICON_SIZE : ICON_SIZE_DEFAULT
                  }
                  color="blueIO-500"
                />
              </View>
            )}
        </Pressable>
        {!this.props.isLastItem && !this.props.hideSeparator && (
          <>
            <VSpacer size={16} />
            <Divider />
          </>
        )}
      </>
    );
  }
}
