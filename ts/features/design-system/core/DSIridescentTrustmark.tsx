import * as React from "react";

import { H4, useIOTheme, VSpacer } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { ItwCredentialTrustmark } from "../../itwallet/presentation/components/ItwCredentialTrustmark";

export const DSIridescentTrustmark = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
    >
      <H4 color={theme["textHeading-default"]}>Trustmark</H4>
      <VSpacer />
      <ItwCredentialTrustmark onPress={() => Alert.alert("QR Code shown")} />
    </DesignSystemScreen>
  );
};
