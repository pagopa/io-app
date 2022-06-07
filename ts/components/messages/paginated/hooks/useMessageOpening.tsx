import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import ROUTES from "../../../../navigation/routes";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";

export const useMessageOpening = () => {
  const navigation = useNavigation();

  const open = useCallback(
    (message: UIMessage) => {
      navigation.navigate(ROUTES.MESSAGES_NAVIGATOR, {
        screen: ROUTES.MESSAGE_ROUTER_PAGINATED,
        params: {
          messageId: message.id,
          isArchived: message.isArchived
        }
      });
    },
    [navigation]
  );

  const alertFor = (message: UIMessage) => {
    if (message.category.tag === TagEnum.PN) {
      // show the bottomsheet if needed
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
    return undefined;
  };

  return (message: UIMessage) => {
    const alert = alertFor(message);
    if (alert) {
      alert();
    } else {
      open(message);
    }
  };
};
