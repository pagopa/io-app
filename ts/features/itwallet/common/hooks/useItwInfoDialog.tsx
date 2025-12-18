import { Alert } from "react-native";

type ItwInfoDialogProps = {
  title: string;
  body: string;
  actions: Array<{
    text: string;
    onPress: () => void;
    style: "default" | "destructive" | "cancel" | undefined;
  }>;
};

/**
 * Allows to show a dialog in which the user chooses to dismiss the current flow.
 * @param title - The title of the dialog.
 * @param body - The description of the dialog.
 * @param actions - the actions to display in the dialog
 * @returns a function that can be used to show the dialog
 */
export const useItwInfoDialog = ({
  title,
  body,
  actions
}: ItwInfoDialogProps) => {
  const show = () => {
    Alert.alert(title, body, [...actions]);
  };

  return { show };
};
