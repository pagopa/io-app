import { memo } from "react";
import type { ImageURISource } from "react-native";
import { Avatar, HStack, IOStyles, Icon } from "@pagopa/io-app-design-system";

type Props = {
  requesterLogoUri: ImageURISource;
};

/**
 * Render icons that display the interaction between the wallet
 * and a requester when exchanging user data.
 */
export const ItwDataExchangeIcons = memo(({ requesterLogoUri }: Props) => (
  <HStack space={8} style={IOStyles.alignCenter}>
    <Avatar size="small" logoUri={requesterLogoUri} />
    <Icon name="transactions" color="grey-450" size={24} />
    <Avatar
      size="small"
      logoUri={require("../../../../../img/app/app-logo-inverted.png")}
    />
  </HStack>
));
