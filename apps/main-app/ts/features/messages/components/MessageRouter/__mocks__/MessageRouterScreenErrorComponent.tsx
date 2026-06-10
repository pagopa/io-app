import { IOButton } from "@pagopa/io-app-design-system";
import { View } from "react-native";

export const MessageRouterScreenErrorComponent = ({
  onRetry,
  onCancel,
  messageId
}: {
  onRetry: () => void;
  onCancel: () => void;
  messageId: string;
}) => (
  <>
    <View testID="mock-msgRouterErrorComponent">
      {`Message Id: ${messageId}`}
    </View>
    <IOButton
      variant="solid"
      label="Mock retry button"
      testID="messageRouterError-retry-button"
      onPress={onRetry}
    />
    <IOButton
      variant="solid"
      label="Mock cancel button"
      testID="messageRouterError-cancel-button"
      onPress={onCancel}
    />
  </>
);
