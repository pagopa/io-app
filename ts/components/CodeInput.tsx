import {
  CodeInput as IOCodeInput,
  WithTestID
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { setAccessibilityFocus } from "../utils/accessibility";

type CodeInputProps = WithTestID<Parameters<typeof IOCodeInput>[0]> & {
  onChange: (text: string) => void;
  accessibilityLabel: string;
  onFocusedA11yView?: React.RefObject<View>;
};

const FOCUS_TIMEOUT = 1000;
const A11Y_FOCUS_TIMEOUT = FOCUS_TIMEOUT + 200;
const FOCUS_TIMEOUT_MS = FOCUS_TIMEOUT as Millisecond;
const A11Y_FOCUS_TIMEOUT_MS = A11Y_FOCUS_TIMEOUT as Millisecond;

/**
 * Temporary wrapper to DS CodeInput to allow keyboard opening on item focus.
 */
export const CodeInput = ({
  onChange,
  accessibilityLabel,
  testID,
  onFocusedA11yView,
  ...props
}: CodeInputProps) => {
  const hiddenInputRef = React.useRef<TextInput>(null);

  useFocusEffect(
    React.useCallback(() => {
      const timeoutId = setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, FOCUS_TIMEOUT_MS);

      if (onFocusedA11yView) {
        setAccessibilityFocus(onFocusedA11yView, A11Y_FOCUS_TIMEOUT_MS);
      }

      return () => {
        clearTimeout(timeoutId);
      };
    }, [onFocusedA11yView])
  );

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden
    >
      <TextInput
        testID={testID}
        accessibilityLabel=""
        secureTextEntry
        ref={hiddenInputRef}
        value={props.value}
        maxLength={props.length}
        onChangeText={onChange}
        style={styles.hiddenInput}
        keyboardType="number-pad"
      />
      <IOCodeInput {...props} variant="dark" />
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenInput: {
    opacity: 0,
    position: "absolute",
    zIndex: 999,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});
