import I18n from "i18next";
import { Alert, AlertButton, AlertOptions } from "react-native";

/**
 * The result of the Alert.
 *
 * - OnPress: one button was pressed
 * - OnDismiss: The user tapped on empty space, dismissing the alert
 */
type AlertResult =
  | { kind: "onDismiss" }
  | { kind: "onPress"; style: AlertButton["style"]; text: AlertButton["text"] };

/**
 * Wraps the {@link Alert.alert} using promises instead of callback. If there are
 * no buttons, the default button "OK" will be used, like the default
 * implementation.
 *
 * @class
 * @param title
 * @param message
 * @param buttons
 * @param options
 */
export const AsyncAlert = (
  title: string,
  message?: string,
  buttons?: Array<AlertButton>,
  options?: AlertOptions
): Promise<AlertResult> => {
  const newButtons: Array<AlertButton> = buttons ?? [
    { text: I18n.t("global.buttons.ok"), style: "default" }
  ];

  return new Promise(resolve => {
    Alert.alert(
      title,
      message,
      newButtons?.map(x => ({
        ...x,
        onPress: () => {
          x.onPress?.();
          resolve({ kind: "onPress", text: x.text, style: x.style });
        }
      })),
      {
        ...options,
        onDismiss: () => {
          options?.onDismiss?.();
          resolve({ kind: "onDismiss" });
        }
      }
    );
  });
};
