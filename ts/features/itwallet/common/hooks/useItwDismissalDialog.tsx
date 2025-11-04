import I18n from "i18next";
import { Alert } from "react-native";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  ItwScreenFlowContext,
  trackItwDismissalAction,
  trackItwDismissalContext
} from "../../analytics";

type ItwDismissalDialogProps = {
  handleDismiss?: () => void;
  dismissalContext?: ItwScreenFlowContext;
  customLabels?: {
    title?: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  };
};

/**
 * Allows to show a dismissal dialog in which the user must confirm the desire to close the current flow.
 * This hook also handles the hardware back button to show the dialog when the user presses the back button.
 * @param handleDismiss - An optionalfunction that will be called when the user confirms the dismissal.
 * @param dismissalContext - An optional dismissal context to be used for analytics tracking.
 * @param customLabels - Optional object to override the default title, message, confirm button label, and cancel button label.
 * @returns a function that can be used to show the dialog
 */
export const useItwDismissalDialog = (props: ItwDismissalDialogProps = {}) => {
  const navigation = useIONavigation();
  const { handleDismiss, dismissalContext, customLabels = {} } = props;

  const title =
    customLabels.title ?? I18n.t("features.itWallet.generic.alert.title");
  const body =
    customLabels.body ?? I18n.t("features.itWallet.generic.alert.body");
  const confirmLabel =
    customLabels.confirmLabel ??
    I18n.t("features.itWallet.generic.alert.confirm");
  const cancelLabel =
    customLabels.cancelLabel ??
    I18n.t("features.itWallet.generic.alert.cancel");

  const trackUserAction = (label: string) => {
    if (dismissalContext) {
      trackItwDismissalAction({
        ...dismissalContext,
        user_action: label
      });
    }
  };

  const show = () => {
    if (dismissalContext) {
      trackItwDismissalContext(dismissalContext);
    }

    Alert.alert(title, body, [
      {
        text: confirmLabel,
        style: "destructive",
        onPress: () => {
          trackUserAction(confirmLabel);
          (handleDismiss || navigation.goBack)();
        }
      },
      {
        text: cancelLabel,
        style: "cancel",
        onPress: () => {
          trackUserAction(cancelLabel);
        }
      }
    ]);
  };

  useHardwareBackButton(() => {
    show();
    return true;
  });

  return { show };
};
