import type { ImageURISource } from "react-native";

import { Avatar, HStack, Icon, useIOColors } from "@io-app/design-system";
import { memo } from "react";

type Props = {
  requesterLogoUri: ImageURISource | undefined;
};

/**
 * Render icons that display the interaction between the wallet and a requester
 * when exchanging user data.
 */
export const ItwDataExchangeIcons = memo(({ requesterLogoUri }: Props) => {
  const colors = useIOColors();

  return (
    <HStack space={8} style={{ alignItems: "center" }}>
      <Avatar logoUri={requesterLogoUri} size="small" />
      <Icon color={colors.icon.default} name="transactions" size={24} />
      <Avatar
        logoUri={require("../../../../../img/app/app-logo-inverted.png")}
        size="small"
      />
    </HStack>
  );
});
