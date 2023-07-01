import * as React from "react";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import I18n from "../../../i18n";

const ItwActivationDetailsScreen = () => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("features.itWallet.title")}
    contextualHelp={emptyContextualHelp}
  >
    {/* TODO: SIW-252 */}
  </BaseScreenComponent>
);

export default ItwActivationDetailsScreen;
