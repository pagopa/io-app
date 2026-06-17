/* eslint-disable functional/immutable-data */
import { Ref, useCallback, useImperativeHandle, useRef, useState } from "react";
import {
  ColorValue,
  Dimensions,
  GestureResponderEvent,
  LayoutChangeEvent,
  LayoutRectangle,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { WithTestID } from "src/utils/types";
import { useIONewTypeface, useIOTheme } from "../../context";
import { IOColors, IOSpacingScale, IOVisualCostants } from "../../core";
import {
  IOFontSize,
  IOMaxFontSizeMultiplier,
  makeFontStyleObject
} from "../../utils/fonts";
import { Icon, IOIconSizeScale } from "../icons";
import {
  buttonTextFontSize,
  buttonTextLineHeight,
  IOText
} from "../typography";

/* Component visual attributes */
const inputPaddingHorizontal: IOSpacingScale = 12;
const inputPaddingVertical: IOSpacingScale = 8;
const inputPaddingClearButton: IOSpacingScale = 8;
const inputRadius: number = 8;
const iconMargin: IOSpacingScale = 8;
const iconSize: IOIconSizeScale = 16;
const iconCloseSize: IOIconSizeScale = 24;
const inputFontSizePlaceholder: IOFontSize = 14;
const cancelButtonMargin: IOSpacingScale = 16;
const inputTransitionDuration: number = 250;

type SearchInputPressableProps = {
  onPress: (event: GestureResponderEvent) => void;
};

type SearchInputActionProps =
  | {
      pressable: SearchInputPressableProps;
      keepCancelVisible?: never;
      onCancel?: never;
      onChangeText?: never;
      value?: never;
    }
  | {
      pressable?: never;
      keepCancelVisible?: boolean;
      onCancel: (event: GestureResponderEvent) => void;
      onChangeText: (value: string) => void;
      value: string;
    };

type SearchInputProps = WithTestID<{
  ref?: Ref<SearchInputRef>;
  accessibilityLabel: TextInputProps["accessibilityLabel"];
  cancelButtonLabel: string;
  clearAccessibilityLabel: string;
  placeholder: TextInputProps["placeholder"];
  autoFocus?: TextInputProps["autoFocus"];
}> &
  SearchInputActionProps;

export type SearchInputRef = {
  focus: () => void;
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const inputWithTimingConfig = {
  duration: inputTransitionDuration,
  easing: Easing.inOut(Easing.cubic)
};

export const SearchInput = ({
  accessibilityLabel,
  cancelButtonLabel,
  clearAccessibilityLabel,
  placeholder,
  autoFocus,
  keepCancelVisible = false,
  onCancel,
  onChangeText,
  pressable,
  testID,
  value = "",
  ref
}: SearchInputProps) => {
  const searchInputRef = useRef<TextInput>(null);
  const { newTypefaceEnabled } = useIONewTypeface();

  /* Component visual attributes */
  const theme = useIOTheme();
  const inputCaretColor = IOColors[theme["interactiveElem-default"]];

  const inputBgColorDefault: ColorValue =
    IOColors[theme["appBackground-secondary"]];
  const inputBgColorFocused: ColorValue =
    IOColors[theme["appBackground-tertiary"]];
  const inputColorPlaceholder: ColorValue =
    IOColors[theme["textBody-tertiary"]];
  const iconColor: IOColors = theme["textBody-tertiary"];

  /* Widths used for the transition:
       - `SearchInput` entire width
       - `Cancel` button */
  const inputWidth: number =
    Dimensions.get("window").width - IOVisualCostants.appMarginDefault * 2;

  const [cancelButtonWidth, setCancelButtonWidth] =
    useState<LayoutRectangle["width"]>(0);

  const getCancelButtonWidth = ({ nativeEvent }: LayoutChangeEvent) => {
    setCancelButtonWidth(nativeEvent.layout.width);
  };

  const inputWidthWithCancel: number = inputWidth - cancelButtonWidth;

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        searchInputRef.current?.focus();
      }
    }),
    []
  );

  /* Reanimated styles */
  const inputAnimatedWidth = useSharedValue<number>(inputWidth);
  const isFocused = useSharedValue(0);

  /* Applied to the `SearchInput` */
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(inputAnimatedWidth.value, inputWithTimingConfig),
    backgroundColor: interpolateColor(
      isFocused.value,
      [0, 1],
      [inputBgColorDefault, inputBgColorFocused]
    )
  }));

  /* Applied to the `Cancel` button */
  const cancelButtonAnimatedStyle = useAnimatedStyle(() => {
    const showCancelButton =
      !pressable && keepCancelVisible ? 1 : isFocused.value;

    return {
      transform: [
        {
          translateX: interpolate(
            showCancelButton,
            [0, 1],
            [cancelButtonWidth + IOVisualCostants.appMarginDefault, 0],
            Extrapolation.CLAMP
          )
        }
      ],
      opacity: interpolate(showCancelButton, [0, 1], [0.5, 1])
    };
  });

  /* Applied to the `Clear` button inside the `SearchInput` */
  const clearButtonAnimatedStyle = useAnimatedStyle(() => {
    const showClearButton = value.length > 0;

    return {
      transform: [
        {
          scale: showClearButton
            ? withTiming(1, inputWithTimingConfig)
            : withTiming(0.5, inputWithTimingConfig)
        }
      ],
      opacity: withTiming(showClearButton ? 1 : 0, inputWithTimingConfig)
    };
  }, [value]);

  /* Related event handlers */
  const handleFocus = () => {
    isFocused.value = withTiming(1, inputWithTimingConfig);
    inputAnimatedWidth.value = inputWidthWithCancel;
  };

  const handleBlur = () => {
    isFocused.value = withTiming(0, inputWithTimingConfig);
    inputAnimatedWidth.value = keepCancelVisible
      ? inputWidthWithCancel
      : inputWidth;
  };

  const handleCancel = useCallback(
    (event: GestureResponderEvent) => {
      onChangeText?.("");
      onCancel?.(event);
    },
    [onCancel, onChangeText]
  );

  const handleClear = useCallback(() => {
    onChangeText?.("");
    searchInputRef.current?.clear();
  }, [onChangeText]);

  const handleChangeText = useCallback(
    (text: string) => onChangeText?.(text),
    [onChangeText]
  );

  const renderSearchBar = () => (
    <Animated.View
      importantForAccessibility={pressable ? "no-hide-descendants" : "auto"}
      style={styles.searchBar}
    >
      <Animated.View
        style={[styles.searchInput, animatedStyle]}
        pointerEvents={pressable ? "none" : "auto"}
      >
        <View style={styles.iconContainer}>
          <Icon
            allowFontScaling
            name="search"
            size={iconSize}
            color={iconColor}
          />
        </View>
        <AnimatedTextInput
          testID={testID}
          ref={searchInputRef}
          inputMode="search"
          returnKeyType="search"
          accessibilityRole={"search"}
          accessibilityLabel={accessibilityLabel}
          numberOfLines={1}
          style={[
            {
              color: IOColors[theme["textBody-default"]],
              ...makeFontStyleObject(
                inputFontSizePlaceholder,
                newTypefaceEnabled ? "Titillio" : "TitilliumSansPro",
                undefined,
                "Regular"
              )
            },
            styles.textInput,
            Platform.OS === "ios"
              ? styles.textInputIOS
              : styles.textInputAndroid
          ]}
          selectionColor={inputCaretColor}
          cursorColor={inputCaretColor}
          placeholder={placeholder}
          placeholderTextColor={inputColorPlaceholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          value={value}
          autoFocus={autoFocus}
          maxFontSizeMultiplier={IOMaxFontSizeMultiplier}
        />

        <AnimatedPressable
          style={[styles.clearButton, clearButtonAnimatedStyle]}
          onPress={handleClear}
          accessibilityLabel={clearAccessibilityLabel}
          accessibilityRole="button"
          hitSlop={16}
        >
          <Icon name="closeSmall" size={iconCloseSize} color={iconColor} />
        </AnimatedPressable>
      </Animated.View>
      <Animated.View
        onLayout={getCancelButtonWidth}
        style={[styles.cancelButton, cancelButtonAnimatedStyle]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={cancelButtonLabel}
          onPress={handleCancel}
        >
          <IOText
            color={theme["interactiveElem-default"]}
            weight={"Semibold"}
            size={buttonTextFontSize}
            lineHeight={buttonTextLineHeight}
            numberOfLines={1}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {cancelButtonLabel}
          </IOText>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );

  return pressable ? (
    <Pressable
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={placeholder}
      onPress={pressable.onPress}
    >
      {renderSearchBar()}
    </Pressable>
  ) : (
    renderSearchBar()
  );
};

const styles = StyleSheet.create({
  searchBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  searchInput: {
    flexShrink: 0,
    borderRadius: inputRadius,
    borderCurve: "continuous",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: inputPaddingHorizontal,
    paddingRight: inputPaddingClearButton
  },
  textInput: {
    flexShrink: 1,
    flexGrow: 1
  },
  textInputIOS: {
    paddingVertical: inputPaddingVertical
  },
  textInputAndroid: {
    textAlignVertical: "center",
    overflow: "hidden"
  },
  iconContainer: {
    marginRight: iconMargin
  },
  cancelButton: {
    position: "absolute",
    right: 0,
    paddingLeft: cancelButtonMargin
  },
  clearButton: {
    transformOrigin: "center",
    marginLeft: iconMargin
  }
});
