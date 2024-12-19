import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import customVariables from "../theme/variables";

/**
 * include content inside KeyboardAvoidingView
 * this wrapper ensures that content will be over the software keyboard when
 * it's toggled on
 * @param content
 */
export const withKeyboard = (
  content: ReactNode,
  insideSafeAreaView: boolean = false
) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === "android" ? undefined : "padding"}
    keyboardVerticalOffset={Platform.select({
      ios: insideSafeAreaView ? 110 : 0,
      android: customVariables.contentPadding
    })}
  >
    {content}
  </KeyboardAvoidingView>
);
