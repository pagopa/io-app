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
  NativeSyntheticEvent,
  StyleSheet,
  TextInputFocusEventData,
  TextInputProps
} from "react-native";
import { NavigationEvents } from "react-navigation";
import color from "color";
import { Input as InputNativeBase } from "native-base";
import { TextInputMaskProps } from "react-native-masked-text";

import { isStringNullyOrEmpty } from "../../utils/strings";
import { makeFontStyleObject } from "../core/fonts";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { WithTestID } from "../../types/WithTestID";
import { H5 } from "../core/typography/H5";
import { IOColors } from "../core/variables/IOColors";
import TextInputMask from "../ui/MaskedInput";
import { Icon, StyleType } from "./Icon";

const styles = StyleSheet.create({
  noBottomLine: {
    borderBottomWidth: 0
  },
  bottomLine: {
    borderBottomWidth: 1
  },
  flex: {
    flex: 1
  },
  textInputMask: {
    ...makeFontStyleObject("Regular")
  }
});

interface TextInputAdditionalProps extends TextInputProps {
  disabled?: boolean;
}

type CommonProp = Readonly<{
  accessibilityHint?: string;
  accessibilityLabel?: string;
  accessibilityLabelIcon?: string;
  description?: string;
  focusBorderColor?: string;
  hasNavigationEvents?: boolean;
  icon?: string | ImageSourcePropType;
  iconColor?: string;
  iconPosition?: "left" | "right";
  iconStyle?: StyleType;
  inputMaskProps?: TextInputMaskProps &
    React.ComponentPropsWithRef<typeof TextInputMask>;
  inputProps?: TextInputAdditionalProps;
  isValid?: boolean;
  label?: string;
  onPress?: () => void;
}>;

export type Props = WithTestID<CommonProp>;

const brandGrayDarken = color(variables.brandGray).darken(0.2).string();

type DescriptionColor = "bluegreyLight" | "bluegreyDark" | "red";
type LabelColor = Exclude<DescriptionColor, "red">;
type ColorByProps = {
  borderColor: string | undefined;
  descriptionColor: DescriptionColor;
  iconColor: string;
  labelColor: LabelColor;
  placeholderTextColor: string;
};
function getColorsByProps({
  isDisabledTextInput,
  hasFocus,
  isEmpty,
  isValid
}: {
  isDisabledTextInput: boolean;
  hasFocus: boolean;
  isEmpty: boolean;
  isValid?: boolean;
}): ColorByProps {
  if (isDisabledTextInput) {
    return {
      borderColor: IOColors.greyLight,
      descriptionColor: "bluegreyLight",
      iconColor: IOColors.bluegreyLight,
      labelColor: "bluegreyLight",
      placeholderTextColor: IOColors.bluegreyLight
    };
  }
  return {
    borderColor:
      hasFocus && isEmpty ? variables.itemBorderDefaultColor : undefined,
    descriptionColor: isValid === false ? "red" : "bluegreyDark",
    iconColor: variables.brandDarkGray,
    placeholderTextColor: brandGrayDarken,
    labelColor: "bluegreyDark"
  };
}
export const LabelledItem: React.FC<Props> = ({
  iconPosition = "left",
  ...props
}: Props) => {
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasFocus, setHasFocus] = useState(false);

  const accessibilityLabel = props.accessibilityLabel ?? "";
  const isValid = props.isValid === undefined ? false : props.isValid;
  const isNotValid = props.isValid === undefined ? false : !props.isValid;

  const {
    borderColor,
    descriptionColor,
    iconColor,
    placeholderTextColor,
    labelColor
  } = getColorsByProps({
    isDisabledTextInput: Boolean(props.inputProps && props.inputProps.disabled),
    hasFocus,
    isEmpty,
    isValid: props.isValid
  });

  const handleOnFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    props.inputProps?.onFocus?.(e);
    setHasFocus(true);
  };

  const handleOnBlur = () => {
    setHasFocus(false);
  };

  /**
   * check if the input is empty and set the value in the state
   */
  const checkInputIsEmpty = (text?: string) =>
    setIsEmpty(isStringNullyOrEmpty(text));

  return (
    <View style={styles.flex}>
      {props.label && (
        <View
          testID="label"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        >
          <Item style={styles.noBottomLine}>
            <H5 color={labelColor}>{props.label}</H5>
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
            borderColor: borderColor || props.focusBorderColor
          }}
          error={isNotValid}
          success={isValid}
          testID="Item"
        >
          {props.hasNavigationEvents && props.onPress && (
            <NavigationEvents
              onWillBlur={props.onPress}
              testID="NavigationEvents"
            />
          )}

          {iconPosition === "left" && props.icon && (
            <Icon
              icon={props.icon}
              iconColor={iconColor}
              iconStyle={props.iconStyle}
              accessibilityLabelIcon={props.accessibilityLabelIcon}
              onPress={props.onPress}
            />
          )}

          {props.inputMaskProps && (
            <TextInputMask
              underlineColorAndroid="transparent"
              style={styles.textInputMask}
              {...props.inputMaskProps}
              onChangeText={(formatted: string, text?: string) => {
                props.inputMaskProps?.onChangeText?.(formatted, text);
                checkInputIsEmpty(text);
              }}
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
              testID={`${props.testID}InputMask`}
            />
          )}

          {props.inputProps && (
            <InputNativeBase
              underlineColorAndroid="transparent"
              {...props.inputProps}
              onChangeText={(text: string) => {
                props.inputProps?.onChangeText?.(text);
                checkInputIsEmpty(text);
              }}
              onFocus={handleOnFocus}
              onBlur={handleOnBlur}
              testID={`${props.testID}Input`}
              disabled={props.inputProps?.disabled}
              placeholderTextColor={placeholderTextColor}
            />
          )}

          {iconPosition === "right" && props.icon && (
            <Icon
              icon={props.icon}
              iconColor={iconColor}
              iconStyle={props.iconStyle}
              accessibilityLabelIcon={props.accessibilityLabelIcon}
              onPress={props.onPress}
            />
          )}
        </Item>
      </View>
      {props.description && (
        <View
          testID="description"
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
          key={"description"}
        >
          <Item style={styles.noBottomLine}>
            <H5
              weight={"Regular"}
              color={descriptionColor}
              testID="H5-description"
            >
              {props.description}
            </H5>
          </Item>
        </View>
      )}
    </View>
  );
};
