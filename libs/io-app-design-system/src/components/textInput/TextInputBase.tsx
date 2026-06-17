/* eslint-disable functional/immutable-data */
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  AccessibilityInfo,
  ColorValue,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  Easing,
  WithTimingConfig,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { useIONewTypeface, useIOTheme } from "../../context";
import { IOColors, IOSpacingScale, hexToRgba } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import {
  IOFontSize,
  IOMaxFontSizeMultiplier,
  makeFontStyleObject
} from "../../utils/fonts";
import { RNTextInputProps, getInputPropsByType } from "../../utils/textInput";
import { InputType, WithTestID } from "../../utils/types";
import { IOIconSizeScale, IOIcons, Icon } from "../icons";
import { HSpacer } from "../layout";
import { BodySmall } from "../typography";

type InputStatus = "initial" | "focused" | "disabled" | "error";

type InputTextProps = WithTestID<{
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  textInputProps?: RNTextInputProps;
  inputType?: InputType;
  status?: InputStatus;
  icon?: IOIcons;
  rightElement?: ReactNode;
  counterLimit?: number;
  showCounterOnlyWhenLimitReached?: boolean;
  accessibilityAnnounceLimitReached?: string;
  bottomMessage?: string;
  bottomMessageColor?: IOColors;
  disabled?: boolean;
  isPassword?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  // autoFocus?: boolean; --- Ignore since this bug is open https://github.com/react-navigation/react-navigation/issues/11643 ---
  /**
   * Optional external ref to the underlying React Native `TextInput`. When
   * provided, the consumer can imperatively call `focus()` / `blur()` on the
   * input. Useful to work around autoFocus issues on React Navigation v7.
   */
  inputRef?: React.RefObject<TextInput | null>;
}>;

const inputMarginTop: IOSpacingScale = 16;
const inputHeight: number = 60;
const inputPaddingHorizontal: IOSpacingScale = 12;
const inputPaddingVertical: IOSpacingScale = 8;
const inputRadius: number = 8;
const inputTransitionDuration: number = 250;
const inputLabelScaleFactor: number = 0.75; /* 16pt becomes 12pt */
const inputLabelFontSize: IOFontSize = 16;
const inputDisabledOpacity: number = 0.5;
const inputRightElementMargin: IOSpacingScale = 8;
const iconSize: IOIconSizeScale = 24;
const iconMargin: IOSpacingScale = 8;

const styles = StyleSheet.create({
  textInput: {
    flexDirection: "row",
    alignItems: "center",
    height: inputHeight,
    paddingVertical: inputPaddingVertical
  },
  textInputOuterBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: inputRadius,
    borderCurve: "continuous",
    borderWidth: 1
  },
  textInputInnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: inputRadius,
    borderCurve: "continuous",
    borderWidth: 2
  },
  textInputStyle: {
    flexGrow: 1,
    flexShrink: 1,
    /* The following `paddingVertical` property fixes a weird bug on
    Android where the text input scrolls, if the user apply some
    gestures on it with keyboard open */
    paddingVertical: 0,
    marginTop: inputMarginTop,
    height: "100%",
    /* Slightly move the input on the left on Android
       to align to the label */
    ...(Platform.OS === "android" && { marginLeft: -4 })
  },
  textInputLabelWrapper: {
    position: "absolute",
    zIndex: 10,
    bottom: 0,
    top: 0,
    justifyContent: "center"
  }
});

type InputTextHelperRow = Pick<
  InputTextProps,
  | "value"
  | "counterLimit"
  | "showCounterOnlyWhenLimitReached"
  | "bottomMessage"
  | "bottomMessageColor"
  | "inputType"
  | "textInputProps"
>;

const HelperRow = ({
  value,
  counterLimit,
  showCounterOnlyWhenLimitReached,
  bottomMessage,
  bottomMessageColor,
  inputType,
  textInputProps
}: InputTextHelperRow) => {
  const theme = useIOTheme();

  const valueCount =
    inputType === "default" ? value.length : value.replace(/\s/g, "").length;

  const helperAccessibilityLabel = useMemo(() => {
    if (textInputProps?.keyboardType === "numeric") {
      return `${value.split("").join(" ")}, ${valueCount} / ${counterLimit}`;
    }
    return `${value}, ${valueCount}`;
  }, [value, valueCount, counterLimit, textInputProps]);

  const bottomMessageColorDefault: IOColors = theme["textBody-tertiary"];
  const bottomMessageColorValue =
    bottomMessageColor ?? bottomMessageColorDefault;

  const shouldShowCounter =
    !!counterLimit &&
    (!showCounterOnlyWhenLimitReached || valueCount >= counterLimit);

  const helperRowStyle: ViewStyle = useMemo(() => {
    if (shouldShowCounter && bottomMessage) {
      return {
        justifyContent: "space-between"
      };
    }
    if (shouldShowCounter) {
      return {
        justifyContent: "flex-end"
      };
    }
    if (bottomMessage) {
      return {
        justifyContent: "flex-start"
      };
    }
    return {};
  }, [shouldShowCounter, bottomMessage]);

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: inputPaddingHorizontal
        },
        helperRowStyle
      ]}
      // in case of error message the element should be ignored by VO or Talkback
      accessibilityElementsHidden={bottomMessageColor === "error-600"}
      importantForAccessibility={
        bottomMessageColor === "error-600" ? "no-hide-descendants" : "auto"
      }
    >
      {bottomMessage && (
        <BodySmall weight="Regular" color={bottomMessageColorValue}>
          {bottomMessage}
        </BodySmall>
      )}
      {shouldShowCounter && (
        <BodySmall
          accessibilityLiveRegion="polite"
          weight="Regular"
          accessibilityLabel={helperAccessibilityLabel}
          color={bottomMessageColorValue}
        >{`${valueCount} / ${counterLimit}`}</BodySmall>
      )}
    </View>
  );
};

export const TextInputBase = ({
  disabled = false,
  placeholder,
  value = "",
  onChangeText,
  accessibilityLabel,
  accessibilityHint,
  textInputProps,
  inputType = "default",
  status,
  icon,
  rightElement,
  counterLimit,
  showCounterOnlyWhenLimitReached,
  accessibilityAnnounceLimitReached,
  bottomMessage,
  bottomMessageColor,
  onBlur,
  onFocus,
  isPassword,
  // autoFocus,
  inputRef: externalInputRef,
  testID
}: InputTextProps) => {
  const internalInputRef = useRef<TextInput>(null);
  const inputRef = externalInputRef ?? internalInputRef;
  const isSecretInput = useMemo(() => isPassword, [isPassword]);
  const [inputStatus, setInputStatus] = useState<InputStatus>(
    disabled ? "disabled" : "initial"
  );
  const focusedState = useSharedValue<number>(0);

  const { newTypefaceEnabled } = useIONewTypeface();
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const theme = useIOTheme();
  const iconColor: IOColors = theme["icon-decorative"];
  const inputLabelColor: ColorValue = IOColors[theme["textInputLabel-default"]];
  const inputTextColor: ColorValue = IOColors[theme["textInputValue-default"]];
  const inputDisabledTextColor: ColorValue =
    IOColors[theme["textInputValue-disabled"]];

  /* Get the label width to enable the correct translation */
  const [labelWidth, setLabelWidth] = useState<number>(0);

  const getLabelWidth = ({ nativeEvent }: LayoutChangeEvent) => {
    setLabelWidth(nativeEvent.layout.width);
  };

  /* Set `inputStatus` when `status` changes
     (e.g. when it's passed as a prop) */
  useEffect(() => {
    if (status) {
      setInputStatus(status);
    }
  }, [status]);

  /* Visual attributes */
  const appBackground: ColorValue = IOColors[theme["appBackground-primary"]];

  const borderColorMap: Record<InputStatus, string> = useMemo(
    () => ({
      initial: IOColors[theme["textInputBorder-default"]],
      disabled: IOColors[theme["textInputBorder-default"]],
      focused: IOColors[theme["interactiveElem-default"]],
      error: IOColors[theme.errorText]
    }),
    [theme]
  );

  const easingConf: WithTimingConfig = {
    duration: inputTransitionDuration,
    easing: Easing.inOut(Easing.cubic)
  };

  const animatedLabelStyle = useAnimatedStyle(() => {
    const enableTransition = focusedState.value || value.length > 0;

    return {
      transform: [
        {
          /* Since we can't have RN 0.73 yet, we use this calculation
          to simulate `transformOrigin: left` */
          translateX: withTiming(
            enableTransition
              ? (-labelWidth * (1 - inputLabelScaleFactor)) / 2
              : 0,
            easingConf
          )
        },
        {
          translateY: withTiming(enableTransition ? -12 : 0, easingConf)
        },
        {
          scale: withTiming(
            enableTransition ? inputLabelScaleFactor : 1,
            easingConf
          )
        }
      ]
    };
  });

  /* Interpolate border color based on input status,
     but not apply the transition on `focus` state
     because it's already managed by the
     `animatedInnerBorderStyle` */
  const animatedOuterBorderStyle = useAnimatedStyle(() => ({
    borderColor:
      inputStatus !== "focused"
        ? interpolateColor(
            1,
            [0, 1],
            [borderColorMap.initial, borderColorMap[inputStatus]]
          )
        : borderColorMap.initial
  }));

  const animatedInnerBorderStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focusedState.value ? 1 : 0, easingConf)
  }));

  const onTextInputPress = () => {
    if (disabled) {
      return;
    }
    focusedState.value = 1;
    setInputStatus("focused");
    // This now works again!
    inputRef.current?.focus();
  };

  const onChangeTextHandler = useCallback(
    (text: string) => {
      const actualTextLength =
        inputType !== "default" ? text.replace(/\s/g, "").length : text.length;

      // Notify the user when the limit is reached
      // This is only for iOS, as Android handles it via accessibilityLiveRegion
      if (
        counterLimit &&
        actualTextLength >= counterLimit &&
        accessibilityAnnounceLimitReached &&
        Platform.OS === "ios"
      ) {
        AccessibilityInfo.announceForAccessibility(
          accessibilityAnnounceLimitReached
        );
      }
      if (counterLimit && actualTextLength > counterLimit) {
        return;
      }

      if (inputType !== "default") {
        // necessary to omit whitespaces added by the valueFormat function
        const formattedText = text.replace(/\s/g, "");
        onChangeText(formattedText);
      } else {
        onChangeText(text);
      }
    },
    [counterLimit, onChangeText, inputType, accessibilityAnnounceLimitReached]
  );

  const onBlurHandler = useCallback(() => {
    focusedState.value = 0;
    onBlur?.();
    setInputStatus("initial");
  }, [focusedState, onBlur]);

  const onFocusHandler = () => {
    // Only update if not already focused to prevent redundant layout passes
    if (focusedState.value !== 1) {
      focusedState.value = 1;
      onFocus?.();
      setInputStatus("focused");
    }
  };

  const derivedInputProps = useMemo(
    () => getInputPropsByType(inputType),
    [inputType]
  );

  const inputValue = useMemo(
    () =>
      derivedInputProps && derivedInputProps.valueFormat
        ? derivedInputProps.valueFormat(value)
        : value,
    [value, derivedInputProps]
  );

  // Calculate the adjusted maxLength to account for spaces
  const adjustedMaxLength = useMemo(() => {
    if (counterLimit && derivedInputProps && derivedInputProps.valueFormat) {
      const spacesCount = Math.floor(counterLimit / 4);
      return counterLimit + spacesCount;
    }
    return counterLimit;
  }, [counterLimit, derivedInputProps]);

  return (
    <>
      <Pressable
        onPress={onTextInputPress}
        style={[
          inputStatus === "disabled" ? { opacity: inputDisabledOpacity } : {},
          styles.textInput,
          {
            paddingHorizontal:
              inputPaddingHorizontal * dynamicFontScale * spacingScaleMultiplier
          }
        ]}
        accessible={false}
        accessibilityRole={"none"}
        importantForAccessibility="no"
      >
        {/* Fake border managed with Animated.View to avoid
            little jumps when the border is animated */}
        <Animated.View
          style={[styles.textInputOuterBorder, animatedOuterBorderStyle]}
        />
        {!disabled && (
          <Animated.View
            style={[
              { borderColor: borderColorMap.focused },
              styles.textInputInnerBorder,
              animatedInnerBorderStyle
            ]}
          />
        )}

        {icon && (
          <>
            <Icon
              allowFontScaling
              name={icon}
              color={iconColor}
              size={iconSize}
            />
            <HSpacer allowScaleSpacing size={iconMargin} />
          </>
        )}
        <TextInput
          ref={inputRef}
          testID={testID}
          {...(derivedInputProps
            ? derivedInputProps.textInputProps
            : textInputProps)}
          accessible
          importantForAccessibility="yes"
          accessibilityElementsHidden={false}
          editable={!disabled}
          secureTextEntry={isSecretInput}
          disableFullscreenUI={true}
          accessibilityState={{ disabled }}
          accessibilityLabel={accessibilityLabel ?? placeholder}
          accessibilityHint={accessibilityHint}
          accessibilityLiveRegion="polite"
          selectionColor={IOColors[theme["interactiveElem-default"]]} // Caret on iOS
          cursorColor={IOColors[theme["interactiveElem-default"]]} // Caret Android
          maxLength={adjustedMaxLength}
          maxFontSizeMultiplier={IOMaxFontSizeMultiplier}
          onBlur={onBlurHandler}
          onFocus={onFocusHandler}
          blurOnSubmit={true}
          onChangeText={onChangeTextHandler}
          style={[
            {
              ...makeFontStyleObject(
                inputLabelFontSize,
                newTypefaceEnabled ? "Titillio" : "TitilliumSansPro",
                undefined,
                "Regular"
              )
            },
            styles.textInputStyle,
            !disabled
              ? { color: inputTextColor }
              : { color: inputDisabledTextColor }
          ]}
          autoFocus={false}
          value={inputValue}
        />
        {/* We translate the label to the right if icon is present
            to align it to the `TextInput` */}
        <Animated.View
          pointerEvents={"none"}
          style={[
            styles.textInputLabelWrapper,
            {
              paddingHorizontal:
                inputPaddingHorizontal *
                dynamicFontScale *
                spacingScaleMultiplier
            },
            icon
              ? {
                  left:
                    (iconSize + iconMargin) *
                    dynamicFontScale *
                    spacingScaleMultiplier
                }
              : {}
          ]}
        >
          <Animated.Text
            onLayout={getLabelWidth}
            numberOfLines={1}
            accessible={false}
            maxFontSizeMultiplier={IOMaxFontSizeMultiplier}
            style={[
              {
                ...makeFontStyleObject(
                  inputLabelFontSize,
                  newTypefaceEnabled ? "Titillio" : "TitilliumSansPro",
                  undefined,
                  "Regular"
                ),
                color: inputLabelColor
              },
              animatedLabelStyle
            ]}
          >
            {placeholder}
          </Animated.Text>
        </Animated.View>
        {rightElement && (
          <Animated.View
            style={{
              alignSelf: "stretch",
              overflow: "visible",
              justifyContent: "center"
            }}
          >
            <LinearGradient
              useAngle={true}
              angle={90}
              style={{
                width: inputRightElementMargin * 3,
                position: "absolute",
                left: -inputRightElementMargin * 3,
                top: 0,
                bottom: 0
              }}
              colors={[hexToRgba(appBackground, 0), appBackground]}
            />
            <HSpacer size={inputRightElementMargin} />
            {rightElement}
          </Animated.View>
        )}
      </Pressable>

      {(bottomMessage || counterLimit) && (
        <HelperRow
          value={inputValue}
          bottomMessage={bottomMessage}
          bottomMessageColor={bottomMessageColor}
          counterLimit={counterLimit}
          showCounterOnlyWhenLimitReached={showCounterOnlyWhenLimitReached}
          inputType={inputType}
          textInputProps={textInputProps}
        />
      )}
    </>
  );
};
