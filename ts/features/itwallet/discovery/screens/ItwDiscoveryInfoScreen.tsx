import {
  ContentWrapper,
  FooterActions,
  ForceScrollDownView,
  H1,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { StyleSheet } from "react-native";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { tosConfigSelector } from "../../../tos/store/selectors";
import {
  trackItWalletActivationStart,
  trackItWalletIntroScreen,
  trackOpenItwTos
} from "../../analytics";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/remoteConfig";
import { selectIsLoading } from "../../machine/eid/selectors";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

/**
 * This is the screen that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen. The screen is wrapped in a GradientScrollView
 * with a primary and secondary action.
 */
const ItwDiscoveryInfoScreen = () => {
  useFocusEffect(trackItWalletIntroScreen);

  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const itwActivationDisabled = useIOSelector(itwIsActivationDisabledSelector);
  const tosConfig = useIOSelector(tosConfigSelector);
  const privacyAndTosUrl = tosConfig.tos_url;

  const handleContinuePress = () => {
    trackItWalletActivationStart();
    machineRef.send({ type: "accept-tos" });
  };

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
        <ItwMarkdown
          styles={{ body: { fontSize: 14 } }}
          onLinkOpen={trackOpenItwTos}
        >
          {I18n.t("features.itWallet.discovery.tos", {
            privacyAndTosUrl
          })}
        </ItwMarkdown>
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "SingleButton",
          primary: {
            loading: isLoading,
            disabled: itwActivationDisabled,
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: handleContinuePress
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
