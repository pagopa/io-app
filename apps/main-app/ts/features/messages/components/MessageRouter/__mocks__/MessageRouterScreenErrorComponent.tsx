import { IOButton } from "@pagopa/io-app-design-system";
import { View } from "react-native";

export const MessageRouterScreenErrorComponent = ({
  onRetry,
  onCancel,
  messageId
}: {
  messageId: string;
  onCancel: () => void;
  onRetry: () => void;
}) => (
  <>
    <View testID="mock-msgRouterErrorComponent">
      {`Message Id: ${messageId}`}
    </View>
    <IOButton
      label="Mock retry button"
      onPress={onRetry}
      testID="messageRouterError-retry-button"
      variant="solid"
    />
    <IOButton
      label="Mock cancel button"
      onPress={onCancel}
      testID="messageRouterError-cancel-button"
      variant="solid"
    />
  </>
);
