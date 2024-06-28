import {
  ContentWrapper,
  ForceScrollDownView,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { ItwSmallText } from "../../common/components/ItwSmallText";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

/**
 * This is the screen that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen. The screen is wrapped in a GradientScrollView
 * with a primary and secondary action.
 */
const ItwDiscoveryInfoScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useOnFirstRender(() => {
    machineRef.send({ type: "start" });
  });

  useHeaderSecondLevel({
    title: "",
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <ForceScrollDownView threshold={50}>
      <Image
        source={require("../../../../../img/features/itWallet/discovery/itw_hero.png")}
        accessibilityIgnoresInvertColors={true}
        style={{ resizeMode: "cover", width: "100%" }}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <ItwMarkdown content={I18n.t("features.itWallet.discovery.content")} />
        <ItwSmallText>{I18n.t("features.itWallet.discovery.tos")}</ItwSmallText>
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: () => undefined
          }
        }}
      />
    </ForceScrollDownView>
  );
};

export { ItwDiscoveryInfoScreen };
