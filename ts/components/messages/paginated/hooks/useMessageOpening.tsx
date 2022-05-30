import { useNavigation } from "@react-navigation/native";
import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import ROUTES from "../../../../navigation/routes";

export const useMessageOpening = () => {
  const navigation = useNavigation();

  return (message: UIMessage) =>
    navigation.navigate(ROUTES.MESSAGES_NAVIGATOR, {
      screen: ROUTES.MESSAGE_ROUTER_PAGINATED,
      params: {
        messageId: message.id,
        isArchived: message.isArchived
      }
    });
};
