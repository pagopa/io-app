import {
  CodeInput as IOCodeInput,
  WithTestID
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View, TextInput, Keyboard } from "react-native";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { setAccessibilityFocus } from "../utils/accessibility";
import I18n from "../i18n";

type CodeInputProps = WithTestID<Parameters<typeof IOCodeInput>[0]> & {
  onChange: (text: string) => void;
  accessibilityLabel: string;
  onFocusedA11yView?: React.RefObject<View>;
};

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

  const [a11yLabel, setA11yLabel] = React.useState(accessibilityLabel);

  React.useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setA11yLabel(accessibilityLabel);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setA11yLabel(
        `${accessibilityLabel}, ${I18n.t(
          "accessibility.doubleTapToActivateHint"
        )}`
      );
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [accessibilityLabel]);

  useFocusEffect(
    React.useCallback(() => {
      const timeoutId = setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 500);

      if (onFocusedA11yView) {
        setAccessibilityFocus(onFocusedA11yView, 600 as Millisecond);
      }

      return () => {
        clearTimeout(timeoutId);
      };
    }, [onFocusedA11yView])
  );

  return (
    <View accessible accessibilityLabel={a11yLabel} accessibilityElementsHidden>
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
