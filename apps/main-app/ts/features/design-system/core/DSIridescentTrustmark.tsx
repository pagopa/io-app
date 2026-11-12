import { H4, VSpacer } from "@io-app/design-system";

import { ItwStoredCredentialsMocks } from "../../itwallet/common/utils/itwMocksUtils";
import { ItwCredentialTrustmark } from "../../itwallet/trustmark/components/ItwCredentialTrustmark";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

export const DSIridescentTrustmark = () => (
  <DesignSystemScreen
    title={DESIGN_SYSTEM_ROUTES.COMPONENTS.TAB_NAVIGATION.title}
  >
    <H4>Trustmark</H4>
    <VSpacer />
    <ItwCredentialTrustmark credential={ItwStoredCredentialsMocks.mdl} />
  </DesignSystemScreen>
);
