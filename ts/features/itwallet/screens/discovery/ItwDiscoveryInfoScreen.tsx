import * as React from "react";
import { GradientScrollView } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ItwMarkdown from "../../components/ItwMarkdown";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";

/**
 * This is the screen that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen. The screen is wrapped in a GradientScrollView
 * with a primary and secondary action.
 */
const ItwDiscoveryInfoScreen = () => {
  useHeaderSecondLevel({
    title: I18n.t("features.itWallet.discovery.title"),
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <RNavScreenWithLargeHeader
      title={{ label: I18n.t("features.itWallet.discovery.title") }}
    >
      <GradientScrollView
        primaryActionProps={{
          label: I18n.t("global.buttons.continue"),
          accessibilityLabel: I18n.t("global.buttons.continue"),
          onPress: () => undefined
        }}
        secondaryActionProps={{
          label: I18n.t("global.buttons.cancel"),
          accessibilityLabel: I18n.t("global.buttons.cancel"),
          onPress: () => undefined
        }}
      >
        {/* Info activation */}
        <ItwMarkdown content={I18n.t("features.itWallet.discovery.content")} />
      </GradientScrollView>
    </RNavScreenWithLargeHeader>
  );
};

export default ItwDiscoveryInfoScreen;
