import { Ref, createRef, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputKeyPressEvent,
  View
} from "react-native";
import Animated from "react-native-reanimated";
import { useIOTheme } from "../../context";
import { triggerHaptic } from "../../functions";
import { useErrorShakeAnimation } from "../../utils/hooks/useErrorShakeAnimation";
import { VSpacer } from "../layout";
import { BodySmall } from "../typography";
import { BoxedInput } from "./BoxedInput";

const OTP_ITEMS_GAP = 8;

export type OTPInputAccessibilityValueText = (params: {
  valueLength: number;
  length: number;
}) => string;

type Props = {
  ref?: Ref<View>;
  value: string;
  onValueChange: (value: string) => void;
  length: number;
  autocomplete?: boolean;
  onValidate?: (value: string) => boolean;
  errorMessage?: string;
  accessibilityLabel?: string;
  deleteButtonAccessibilityLabel?: string;
  accessibilityHint?: string;
  inputAccessoryViewID?: string;
  autoFocus?: boolean;
};

export type OTPInputSecretProps =
  | {
      secret: true;
      accessibilityValueText: OTPInputAccessibilityValueText;
    }
  | {
      secret?: false;
      accessibilityValueText?: OTPInputAccessibilityValueText;
    };

export type OTPInputProps = Props & OTPInputSecretProps;

/**
 * `OTPInput` is a component that allows the user to enter a one-time password.
 * It has an hidden `TextInput` that is used to handle the keyboard and the focus.
 * The input handles the autocompletion of the OTP code.
 * @param value - The value of the OTP code
 * @param onValueChange - The function to call when the value changes
 * @param length - The length of the OTP code
 * @param secret - If the OTP code should be hidden
 * @param autocomplete - If the OTP code should be autocompleted
 * @param onValidate - The function to call when the OTP code is validated
 * @param errorMessage - The error message to display
 * @returns
 */
export const OTPInput = ({
  value,
  onValueChange,
  length,
  accessibilityLabel,
  accessibilityHint,
  onValidate,
  errorMessage = "",
  autocomplete = false,
  inputAccessoryViewID,
  autoFocus = false,
  deleteButtonAccessibilityLabel,
  ref,
  ...props
}: OTPInputProps) => {
  const [hasFocus, setHasFocus] = useState(autoFocus);
  const [hasError, setHasError] = useState(false);
  const isSecret = props.secret === true;

  const theme = useIOTheme();

  const { translate, animatedStyle, shakeAnimation } = useErrorShakeAnimation();

  const inputRef = createRef<TextInput>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleValidate = (val: string) => {
    if (!onValidate || val.length < length) {
      return;
    }
    const isValid = onValidate(val);
    if (!isValid) {
      setHasError(true);
      triggerHaptic("notificationError");
      // eslint-disable-next-line functional/immutable-data
      translate.value = shakeAnimation();

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // eslint-disable-next-line functional/immutable-data
      timerRef.current = setTimeout(() => {
        setHasError(false);
        onValueChange("");
      }, 500);
    }
  };

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  const handleChange = (value: string) => {
    if (value.length > length) {
      return;
    }
    onValueChange(value);
    handleValidate(value);
  };

  const handleKeyPress = (e: TextInputKeyPressEvent) => {
    switch (e.nativeEvent.key) {
      case "Backspace":
        if (deleteButtonAccessibilityLabel && value.length > 0) {
          AccessibilityInfo.announceForAccessibility(
            deleteButtonAccessibilityLabel
          );
        }
        break;
      default:
        if (!isSecret) {
          AccessibilityInfo.announceForAccessibility(e.nativeEvent.key);
        }
        break;
    }
  };

  const accessibilityValueTextParams = {
    valueLength: value.length,
    length
  };

  const accessibilityValueText = isSecret
    ? props.accessibilityValueText(accessibilityValueTextParams)
    : props.accessibilityValueText?.(accessibilityValueTextParams) ??
      value.split("").join(", ");

  const cells = useMemo(() => Array.from({ length }), [length]);

  return (
    <Animated.View style={[{ flexGrow: 1 }, animatedStyle]}>
      <Pressable
        onPress={() => {
          inputRef.current?.focus();
          setHasFocus(true);
        }}
        ref={ref}
        accessible={false}
      >
        <TextInput
          value={value}
          onChangeText={handleChange}
          onKeyPress={handleKeyPress}
          caretHidden={Platform.OS === "ios"}
          style={[
            StyleSheet.absoluteFillObject,
            // Keep the hidden TextInput minimally visible so native focus still works.
            { opacity: 0.01 }
          ]}
          maxLength={length}
          ref={inputRef}
          onBlur={() => setHasFocus(false)}
          keyboardType="numeric"
          inputMode="numeric"
          returnKeyType="done"
          textContentType="oneTimeCode"
          autoComplete={autocomplete ? "sms-otp" : undefined}
          inputAccessoryViewID={inputAccessoryViewID}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          // Keep secret values out of the screen reader output.
          accessibilityValue={{ text: accessibilityValueText }}
          autoFocus={autoFocus}
          secureTextEntry={isSecret}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            columnGap: OTP_ITEMS_GAP,
            flexGrow: 1,
            zIndex: 10
          }}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          {cells.map((_, i) => (
            <BoxedInput
              key={i}
              status={
                hasError
                  ? "error"
                  : hasFocus && value.length === i
                  ? "focus"
                  : "default"
              }
              secret={isSecret}
              value={value[i]}
            />
          ))}
        </View>
      </Pressable>
      <VSpacer size={4} />
      {hasError && errorMessage && (
        <BodySmall
          weight="Semibold"
          color={theme.errorText}
          style={{ textAlign: "center" }}
        >
          {errorMessage}
        </BodySmall>
      )}
    </Animated.View>
  );
};
