import * as React from "react";
import { ContentWrapper } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ItwMarkdown from "../../components/ItwMarkdown";
import { RNavScreenWithLargeHeader } from "../../../../components/ui/RNavScreenWithLargeHeader";
import { FooterStackButton } from "../../components/FooterStackButton";

/**
 * This is the screen that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen. The screen is wrapped in a GradientScrollView
 * with a primary and secondary action.
 */
const ItwDiscoveryInfoScreen = () => {
  useHeaderSecondLevel({
    title: I18n.t("features.itWallet.discovery.info.title"),
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <RNavScreenWithLargeHeader
      title={{ label: I18n.t("features.itWallet.discovery.info.title") }}
      fixedBottomSlot={
        <FooterStackButton
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
        />
      }
    >
      <ContentWrapper>
        {/* Info activation */}
        <ItwMarkdown
          content={I18n.t("features.itWallet.discovery.info.content")}
        />
      </ContentWrapper>
    </RNavScreenWithLargeHeader>
  );
};

export { ItwDiscoveryInfoScreen };
