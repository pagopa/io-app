import {
  ContentWrapper,
  ForceScrollDownView,
  H1,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet } from "react-native";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";
import { ItwTags } from "../../machine/tags";

/**
 * This is the screen that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen. The screen is wrapped in a GradientScrollView
 * with a primary and secondary action.
 */
const ItwDiscoveryInfoScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(snap =>
    snap.hasTag(ItwTags.Loading)
  );

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
      <AnimatedImage
        source={require("../../../../../img/features/itWallet/discovery/itw_hero.png")}
        style={styles.hero}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <H1>{I18n.t("features.itWallet.discovery.title")}</H1>
        <VSpacer size={24} />
        <ItwMarkdown>
          {I18n.t("features.itWallet.discovery.content")}
        </ItwMarkdown>
        <ItwMarkdown styles={{ body: { fontSize: 14 } }}>
          {I18n.t("features.itWallet.discovery.tos")}
        </ItwMarkdown>
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "SingleButton",
          primary: {
            loading: isLoading,
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: () => machineRef.send({ type: "accept-tos" })
          }
        }}
      />
    </ForceScrollDownView>
  );
};

const styles = StyleSheet.create({
  hero: { resizeMode: "cover", width: "100%" }
});

export { ItwDiscoveryInfoScreen };
