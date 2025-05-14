import { memo } from "react";
import type { ImageURISource } from "react-native";
import { Avatar, HStack, Icon, useIOTheme } from "@pagopa/io-app-design-system";

type Props = {
  requesterLogoUri: ImageURISource | undefined;
};

/**
 * Render icons that display the interaction between the wallet
 * and a requester when exchanging user data.
 */
export const ItwDataExchangeIcons = memo(({ requesterLogoUri }: Props) => {
  const theme = useIOTheme();

  return (
    <HStack space={8} style={{ alignItems: "center" }}>
      <Avatar size="small" logoUri={requesterLogoUri} />
      <Icon name="transactions" color={theme["icon-default"]} size={24} />
      <Avatar
        size="small"
        logoUri={require("../../../../../img/app/app-logo-inverted.png")}
      />
    </HStack>
  );
});
