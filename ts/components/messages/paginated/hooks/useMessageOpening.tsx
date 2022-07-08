import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import ROUTES from "../../../../navigation/routes";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { usePnOpenConfirmationBottomSheet } from "../../../../features/pn/components/PnOpenConfirmationBottomSheet";
import { pnEnabled } from "../../../../config";

export const useMessageOpening = () => {
  const navigation = useNavigation();

  const navigate = useCallback(
    (message: UIMessage) => {
      navigation.navigate(ROUTES.MESSAGES_NAVIGATOR, {
        screen: ROUTES.MESSAGE_ROUTER_PAGINATED,
        params: {
          messageId: message.id
        }
      });
    },
    [navigation]
  );

  const pnBottomSheet = usePnOpenConfirmationBottomSheet({
    onConfirm: (message: UIMessage, _: boolean) => {
      navigate(message);
    }
  });

  const alertFor = (message: UIMessage) => {
    if (message.category.tag === TagEnum.PN && pnEnabled) {
      // show the bottomsheet if needed
      return () => pnBottomSheet.present(message);
    }
    return undefined;
  };

  const open = (message: UIMessage) => {
    const alert = alertFor(message);
    if (alert) {
      alert();
    } else {
      navigate(message);
    }
  };

  return {
    open,
    bottomSheets: [pnBottomSheet.bottomSheet]
  };
};
