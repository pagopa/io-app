import { Alert } from "react-native";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  ItwDismissalContext,
  trackItwDismissalAction,
  trackItwDismissalContext
} from "../../analytics";

type ItwDismissalDialogProps = {
  handleDismiss?: () => void;
  customBodyMessage?: string;
  dismissalContext?: ItwDismissalContext;
};

const confirmText = I18n.t("features.itWallet.generic.alert.confirm");
const cancelText = I18n.t("features.itWallet.generic.alert.cancel");

/**
 * Allows to show a dismissal dialog in which the user must confirm the desire to close the current flow.
 * This hook also handles the hardware back button to show the dialog when the user presses the back button.
 * @param handleDismiss - An optionalfunction that will be called when the user confirms the dismissal.
 * @param customBodyMessage - An optional custom message to be shown in the dialog body.
 * @param dismissalContext - An optional dismissal context to be used for analytics tracking.
 * @returns a function that can be used to show the dialog
 */
export const useItwDismissalDialog = (props?: ItwDismissalDialogProps) => {
  const navigation = useIONavigation();

  const handleDismiss = props?.handleDismiss;
  const customBodyMessage = props?.customBodyMessage;
  const dismissalContext = props?.dismissalContext;

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
    Alert.alert(
      I18n.t("features.itWallet.generic.alert.title"),
      customBodyMessage || I18n.t("features.itWallet.generic.alert.body"),
      [
        {
          text: confirmText,
          style: "destructive",
          onPress: () => {
            trackUserAction(confirmText);
            (handleDismiss || navigation.goBack)();
          }
        },
        {
          text: cancelText,
          style: "cancel",
          onPress: () => {
            trackUserAction(cancelText);
          }
        }
      ]
    );
  };

  useHardwareBackButton(() => {
    show();
    return true;
  });

  return { show };
};
