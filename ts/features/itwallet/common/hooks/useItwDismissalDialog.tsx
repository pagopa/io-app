import { Alert } from "react-native";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  ItwScreenFlowContext,
  trackItwDismissAction,
  trackItwDismissContext
} from "../../analytics";

type ItwDismissalDialogProps = {
  handleDismiss?: () => void;
  dismissContext?: ItwScreenFlowContext;
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
 * @param dismissContext - An optional dismiss context to be used for analytics tracking.
 * @param customLabels - Optional object to override the default title, message, confirm button label, and cancel button label.
 * @returns a function that can be used to show the dialog
 */
export const useItwDismissalDialog = (props?: ItwDismissalDialogProps) => {
  const navigation = useIONavigation();

  const { handleDismiss, dismissContext, customLabels = {} } = props ?? {};

  const labels = {
    title:
      customLabels.title ?? I18n.t("features.itWallet.generic.alert.title"),
    body: customLabels.body ?? I18n.t("features.itWallet.generic.alert.body"),
    confirm:
      customLabels.confirmLabel ??
      I18n.t("features.itWallet.generic.alert.confirm"),
    cancel:
      customLabels.cancelLabel ??
      I18n.t("features.itWallet.generic.alert.cancel")
  };

  const trackUserAction = (label: string) => {
    if (dismissContext) {
      trackItwDismissAction({
        ...dismissContext,
        user_action: label
      });
    }
  };

  const show = () => {
    if (dismissContext) {
      trackItwDismissContext(dismissContext);
    }

    Alert.alert(labels.title, labels.body, [
      {
        text: labels.confirm,
        style: "destructive",
        onPress: () => {
          trackUserAction(labels.confirm);
          (handleDismiss || navigation.goBack)();
        }
      },
      {
        text: labels.cancel,
        style: "cancel",
        onPress: () => {
          trackUserAction(labels.cancel);
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
