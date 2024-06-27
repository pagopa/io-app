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
import { ItwSmallText } from "../../common/components/ItwSmallText";
import ItwMarkdown from "../../common/components/ItwMarkdown";

/**
 * This is the screen that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen. The screen is wrapped in a GradientScrollView
 * with a primary and secondary action.
 */
const ItwDiscoveryInfoScreen = () => {
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
        {/* Info activation */}
        <ItwMarkdown
          content={I18n.t("features.itWallet.discovery.info.content")}
        />
        <ItwSmallText>
          Per maggiori informazioni, leggi l’[informativa Privacy]() e i
          [Termini e Condizioni d’uso]()
        </ItwSmallText>
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
