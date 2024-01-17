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
import color from "color";
import { Input as InputNativeBase, Item } from "native-base";
import * as React from "react";
import { useState } from "react";
import {
  ImageSourcePropType,
  ImageStyle,
  NativeSyntheticEvent,
  StyleSheet,
  TextInputFocusEventData,
  TextInputProps,
  View
} from "react-native";
import { TextInputMaskProps } from "react-native-masked-text";
import { IOColors, IOIcons } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "../../i18n";
import { WithTestID } from "../../types/WithTestID";

import { isStringNullyOrEmpty } from "../../utils/strings";
import { makeFontStyleObject } from "../core/fonts";
import { H5 } from "../core/typography/H5";
import { IOStyles } from "../core/variables/IOStyles";
import TextInputMask from "../ui/MaskedInput";
import { LabelledItemIconOrImage } from "./LabelledItemIconOrImage";

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
  overrideBorderColor?: string;
  hasNavigationEvents?: boolean;
  icon?: IOIcons | ImageSourcePropType;
  iconColor?: IOColors;
  imageStyle?: ImageStyle;
  iconPosition?: "left" | "right";
  inputMaskProps?: TextInputMaskProps &
    React.ComponentPropsWithRef<typeof TextInputMask>;
  inputProps?: TextInputAdditionalProps;
  isValid?: boolean;
  label?: string;
  onPress?: () => void;
  inputAccessoryViewID?: string;
}>;

export type Props = WithTestID<CommonProp>;

/* TODO: Replace this generated color variable with a value from IOCOlors
Or Alias Token from variables.ts */
const brandGrayDarken = color(IOColors.greyUltraLight).darken(0.2).string();

type DescriptionColor = "bluegreyLight" | "bluegreyDark" | "red";
type LabelColor = Exclude<DescriptionColor, "red">;
type ColorByProps = {
  borderColor: string | undefined;
  descriptionColor: DescriptionColor;
  iconColor: IOColors;
  labelColor: LabelColor;
  placeholderTextColor: string;
};
function getColorsByProps({
  isDisabledTextInput,
  hasFocus,
  isEmpty,
  isValid,
  iconColor
}: {
  isDisabledTextInput: boolean;
  hasFocus: boolean;
  isEmpty: boolean;
  isValid?: boolean;
  iconColor?: IOColors;
}): ColorByProps {
  if (isDisabledTextInput) {
    return {
      borderColor: IOColors.greyLight,
      descriptionColor: "bluegreyLight",
      iconColor: iconColor ?? "bluegreyLight",
      labelColor: "bluegreyLight",
      placeholderTextColor: IOColors.bluegreyLight
    };
  }
  return {
    borderColor: hasFocus && isEmpty ? IOColors.milderGray : undefined,
    descriptionColor: isValid === false ? "red" : "bluegreyDark",
    iconColor: iconColor ?? "bluegrey",
    placeholderTextColor: brandGrayDarken,
    labelColor: "bluegreyDark"
  };
}

const NavigationEventHandler = ({ onPress }: { onPress: () => void }) => {
  useFocusEffect(React.useCallback(() => onPress, [onPress]));

  return <></>;
};

export const LabelledItem: React.FC<Props> = ({
  iconPosition = "left",
  ...props
}: Props) => {
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasFocus, setHasFocus] = useState(false);
  const accessibilityLabel = props.accessibilityLabel ?? "";

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
    isValid: props.isValid,
    iconColor: props.iconColor
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

      <View>
        <View
          style={{
            ...IOStyles.row,
            ...styles.bottomLine,
            borderColor: props.overrideBorderColor
              ? props.overrideBorderColor
              : borderColor || props.focusBorderColor
          }}
          testID="Item"
        >
          {props.hasNavigationEvents && props.onPress && (
            <NavigationEventHandler onPress={props.onPress} />
          )}

          {/* Icon OR Image. They can't be managed separately because
          credit card sorting have a fallback value that's an icon,
          not an image */}
          {iconPosition === "left" && props.icon && (
            <LabelledItemIconOrImage
              icon={props.icon}
              iconColor={iconColor}
              imageStyle={props.imageStyle}
              accessible={false}
              accessibilityLabelIcon={props.accessibilityLabelIcon}
              onPress={props.onPress}
            />
          )}

          {props.inputMaskProps && (
            <TextInputMask
              accessible={true}
              accessibilityLabel={I18n.t("global.accessibility.textField", {
                inputLabel: accessibilityLabel
              })}
              accessibilityHint={props.accessibilityHint}
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
              inputAccessoryViewID={props.inputAccessoryViewID}
            />
          )}

          {props.inputProps && (
            <InputNativeBase
              accessible={true}
              accessibilityLabel={I18n.t("global.accessibility.textField", {
                inputLabel: accessibilityLabel
              })}
              accessibilityHint={props.accessibilityHint}
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
              inputAccessoryViewID={props.inputAccessoryViewID}
            />
          )}

          {iconPosition === "right" && props.icon && (
            <LabelledItemIconOrImage
              icon={props.icon}
              iconColor={iconColor}
              imageStyle={props.imageStyle}
              accessibilityLabelIcon={props.accessibilityLabelIcon}
              onPress={props.onPress}
            />
          )}
        </View>
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
