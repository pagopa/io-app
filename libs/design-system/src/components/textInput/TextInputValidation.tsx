import {
  ComponentProps,
  Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { AccessibilityInfo, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
import { useIOTheme } from "../../context";
import { IOColors } from "../../core/IOColors";
import {
  enterTransitionInputIcon,
  exitTransitionInputIcon
} from "../../core/IOTransitions";
import { triggerHaptic } from "../../functions";
import { TextInputValidationRefProps } from "../../utils/types";
import { IOIconSizeScale, IOIcons, Icon } from "../icons";
import { TextInputBase } from "./TextInputBase";

export type ValidationWithOptions = { isValid: boolean; errorMessage: string };

type TextInputValidationProps = Omit<
  ComponentProps<typeof TextInputBase>,
  "rightElement" | "status" | "bottomMessageColor" | "isPassword" | "ref"
> & {
  ref?: Ref<TextInputValidationRefProps>;
  /**
   * If true, the character counter will only be displayed/announced when the counter limit is reached.
   * If false or undefined, the character counter will be displayed/announced whenever the counter is enabled,
   * including before the user starts typing (for example, `0 / limit`).
   */
  showCounterOnlyWhenLimitReached?: boolean;
  /**
   * This function can return either a `boolean` or a `ValidationWithOptions` object.
   * If a `boolean` is returned and the field is not valid, the value of the errorMessage prop will be displayed/announced.
   * If a `ValidationWithOptions` object is returned and the field is not valid, the value displayed/announced will be the one contained within this object.
   */
  onValidate: (value: string) => boolean | ValidationWithOptions;
  /**
   * In case of a dynamic `errorMessage`, use the `onValidate` function with a `ValidationWithOptions` object as the return value to ensure that screen readers announce the correct value.
   */
  errorMessage: string;
  /**
   * Determines the validation mode. If "onBlur", validation occurs on blur. If "onContinue", validation occurs when an external button is pressed.
   */
  validationMode?: "onBlur" | "onContinue";
  /**
   * A string that will be read by screen readers when the field is not valid.
   */
  accessibilityErrorLabel?: string;
};

function isValidationWithOptions(
  validation: boolean | ValidationWithOptions
): validation is ValidationWithOptions {
  return (
    typeof validation === "object" &&
    "isValid" in validation &&
    "errorMessage" in validation
  );
}

const feedbackIconSize: IOIconSizeScale = 24;

export const TextInputValidation = ({
  onValidate,
  errorMessage,
  value,
  bottomMessage,
  onBlur,
  onFocus,
  validationMode = "onBlur",
  accessibilityErrorLabel,
  ref,
  ...props
}: TextInputValidationProps) => {
  const theme = useIOTheme();
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
  const [errMessage, setErrMessage] = useState(errorMessage);

  const getErrorFeedback = useCallback(
    (isValid: boolean, message: string) => {
      setIsValid(isValid);
      setErrMessage(message);

      if (!isValid) {
        triggerHaptic("notificationError");
        AccessibilityInfo.announceForAccessibilityWithOptions(
          accessibilityErrorLabel ?? message,
          {
            queue: true
          }
        );
      } else {
        triggerHaptic("notificationSuccess");
      }
    },
    [accessibilityErrorLabel]
  );

  const inputRef = useRef<TextInput>(null);

  const validateInput = useCallback(() => {
    const validation = onValidate(value);

    if (isValidationWithOptions(validation)) {
      getErrorFeedback(validation.isValid, validation.errorMessage);
    } else {
      getErrorFeedback(validation, errorMessage);
    }
  }, [value, errorMessage, onValidate, getErrorFeedback]);

  // Expose the validateInput function and focus/blur controls to the parent component
  useImperativeHandle(ref, () => ({
    validateInput,
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur()
  }));

  const onBlurHandler = useCallback(() => {
    if (validationMode === "onBlur") {
      validateInput();
    }
    onBlur?.();
  }, [validationMode, validateInput, onBlur]);

  const onFocusHandler = useCallback(() => {
    setIsValid(undefined);
    onFocus?.();
  }, [onFocus]);

  const labelError = useMemo(
    () => (isValid === false && errMessage ? errMessage : bottomMessage),
    [isValid, errMessage, bottomMessage]
  );

  const labelErrorColor: IOColors | undefined = useMemo(
    () => (isValid === false && errMessage ? theme.errorText : undefined),
    [isValid, errMessage, theme.errorText]
  );

  const feedbackIconAttrMap: Record<
    string,
    { name: IOIcons; color: IOColors }
  > = useMemo(
    () => ({
      valid: {
        name: "success",
        color: theme.successIcon
      },
      notValid: {
        name: "errorFilled",
        color: theme.errorIcon
      }
    }),
    [theme]
  );

  const feedbackIcon = useMemo(() => {
    const validationStatus = isValid ? "valid" : "notValid";

    return isValid !== undefined ? (
      <Animated.View
        entering={enterTransitionInputIcon}
        exiting={exitTransitionInputIcon}
      >
        <Icon
          name={feedbackIconAttrMap[validationStatus].name}
          color={feedbackIconAttrMap[validationStatus].color}
          size={feedbackIconSize}
        />
      </Animated.View>
    ) : (
      <View style={{ width: feedbackIconSize, height: feedbackIconSize }} />
    );
  }, [feedbackIconAttrMap, isValid]);

  return (
    <TextInputBase
      {...props}
      inputRef={inputRef}
      value={value}
      status={isValid === false ? "error" : undefined}
      bottomMessage={labelError}
      bottomMessageColor={labelErrorColor}
      rightElement={feedbackIcon}
      onBlur={onBlurHandler}
      onFocus={onFocusHandler}
    />
  );
};
