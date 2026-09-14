import { IOVisualCostants } from "@io-app/design-system";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

/**
 * include content inside KeyboardAvoidingView
 * this wrapper ensures that content will be over the software keyboard when
 * it's toggled on
 * @param content
 */
export const withKeyboard = (
  content: ReactNode,
  insideSafeAreaView = false
) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === "android" ? undefined : "padding"}
    keyboardVerticalOffset={Platform.select({
      ios: insideSafeAreaView ? 110 : 0,
      android: IOVisualCostants.appMarginDefault
    })}
  >
    {content}
  </KeyboardAvoidingView>
);
