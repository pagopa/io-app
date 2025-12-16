import { H4, useIOTheme, VSpacer } from "@pagopa/io-app-design-system";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

import { ItwStoredCredentialsMocks } from "../../itwallet/common/utils/itwMocksUtils";
import { ItwCredentialTrustmark } from "../../itwallet/trustmark/components/ItwCredentialTrustmark";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSIridescentTrustmark = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
    >
      <H4 color={theme["textHeading-default"]}>Trustmark</H4>
      <VSpacer />
      <ItwCredentialTrustmark credential={ItwStoredCredentialsMocks.mdl} />
    </DesignSystemScreen>
  );
};
