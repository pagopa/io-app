import * as React from "react";
import { GradientScrollView } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ItwMarkdown from "../../components/ItwMarkdown";

const ItwDiscoveryInfoScreen = () => {
  useHeaderSecondLevel({
    title: I18n.t("features.itWallet.discovery.title"),
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Continua",
        accessibilityLabel: "Continue",
        onPress: () => undefined
      }}
      secondaryActionProps={{
        label: "Annulla",
        accessibilityLabel: "RptIt casuale",
        onPress: () => undefined
      }}
    >
      {/* Info activation */}
      <ItwMarkdown content={I18n.t("features.itWallet.discovery.content")} />
    </GradientScrollView>
  );
};

export default ItwDiscoveryInfoScreen;
