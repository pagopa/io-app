import {
  CodeInput as IOCodeInput,
  WithTestID
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View, TextInput } from "react-native";

type CodeInputProps = WithTestID<Parameters<typeof IOCodeInput>[0]> & {
  onChange: (text: string) => void;
  accessibilityLabel: string;
};

/**
 * Temporary wrapper to DS CodeInput to allow keyboard opening on item focus.
 */
export const CodeInput = ({
  onChange,
  accessibilityLabel,
  testID,
  ...props
}: CodeInputProps) => {
  const hiddenInputRef = React.useRef<TextInput>(null);

  useFocusEffect(
    React.useCallback(() => {
      const timeoutId = setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 500);

      return () => {
        clearTimeout(timeoutId);
      };
    }, [])
  );

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <TextInput
        testID={testID}
        accessibilityLabel="Text input field"
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
