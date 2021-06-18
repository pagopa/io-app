/**
 * Display a labelled, followed by a
 * input and an icon on the left-end
 * side of the input
 *
 * LABEL
 * X __________
 * ^     ^
 * icon  |
 *       input
 */
import { Item, View } from "native-base";
import * as React from "react";
import { useState } from "react";
import {
  ImageSourcePropType,
  ImageStyle,
  StyleSheet,
  TextInputProps
} from "react-native";
import { TextInputMaskProps } from "react-native-masked-text";
import { IconProps } from "react-native-vector-icons/Icon";
import { NavigationEvents } from "react-navigation";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { WithTestID } from "../../types/WithTestID";
import { H5 } from "../core/typography/H5";
import TextInputMask from "../ui/MaskedInput";
import { Icon } from "./Icon";
import { Input } from "./Input";

const styles = StyleSheet.create({
  noBottomLine: {
    borderBottomWidth: 0
  },
  bottomLine: {
    borderBottomWidth: 1
  }
});

// Style type must be generalized so as to support both text icons and image icons
type StyleType = IconProps["style"] & ImageStyle;

type CommonProp = Readonly<{
  label?: string;
  icon?: string | ImageSourcePropType;
  iconPosition?: "left" | "right";
  iconStyle?: StyleType;
  iconColor?: string;
  isValid?: boolean;
  focusBorderColor?: string;
  description?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityLabelIcon?: string;
  onPress?: () => void;
  hasNavigationEvents?: boolean;
}>;

interface InputProps extends TextInputProps {
  disabled?: boolean;
}

type Props = WithTestID<CommonProp> &
  (
    | Readonly<{
        type: "masked";
        inputMaskProps: TextInputMaskProps &
          React.ComponentPropsWithRef<typeof TextInputMask>;
      }>
    | Readonly<{
        type: "text";
        inputProps: InputProps;
      }>
  );

export const LabelledItem: React.FC<Props> = ({
  iconPosition = "left",
  ...props
}: Props) => {
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasFocus, setHasFocus] = useState(false);

  const descriptionColor = props.isValid === false ? "red" : "bluegreyDark";
  const accessibilityLabel = props.accessibilityLabel ?? "";
  const inputBorderColor =
    hasFocus && isEmpty
      ? variables.itemBorderDefaultColor
      : props.focusBorderColor;
  const isValid = props.isValid === undefined ? false : props.isValid;
  const isNotValid = props.isValid === undefined ? false : !props.isValid;

  return (
    <View>
      {props.label && (
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        >
          <Item style={styles.noBottomLine}>
            <H5>{props.label}</H5>
          </Item>
        </View>
      )}

      <View
        accessible={true}
        accessibilityLabel={I18n.t("global.accessibility.textField", {
          inputLabel: accessibilityLabel
        })}
        accessibilityHint={props.accessibilityHint}
      >
        <Item
          style={{
            ...styles.bottomLine,
            borderColor: inputBorderColor
          }}
          error={isNotValid}
          success={isValid}
        >
          {props.hasNavigationEvents && props.onPress && (
            <NavigationEvents onWillBlur={props.onPress} />
          )}

          {iconPosition === "left" && (
            <Icon
              icon={props.icon}
              iconColor={props.iconColor}
              iconStyle={props.iconStyle}
              accessibilityLabelIcon={props.accessibilityLabelIcon}
              onPress={props.onPress}
            />
          )}

          <Input setHasFocus={setHasFocus} setIsEmpty={setIsEmpty} {...props} />

          {iconPosition === "right" && (
            <Icon
              icon={props.icon}
              iconColor={props.iconColor}
              iconStyle={props.iconStyle}
              accessibilityLabelIcon={props.accessibilityLabelIcon}
              onPress={props.onPress}
            />
          )}
        </Item>
      </View>
      {props.description && (
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
          key={"description"}
        >
          <Item style={styles.noBottomLine}>
            <H5 weight={"Regular"} color={descriptionColor}>
              {props.description}
            </H5>
          </Item>
        </View>
      )}
    </View>
  );
};
