import { ContentWrapper, H1, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { AnimatedImage } from "../../../../components/AnimatedImage.tsx";
import IOMarkdown from "../../../../components/IOMarkdown/index.tsx";
import { IOScrollView } from "../../../../components/ui/IOScrollView.tsx";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel.tsx";
import { useIOSelector } from "../../../../store/hooks.ts";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp.tsx";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { tosConfigSelector } from "../../../tos/store/selectors/index.ts";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum.ts";
import {
  trackItWalletActivationStart,
  trackItwIntroBack,
  trackOpenItwTos
} from "../../analytics/index.ts";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog.tsx";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/remoteConfig.ts";
import { generateItwIOMarkdownRules } from "../../common/utils/markdown.tsx";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider.tsx";
import { selectIsLoading } from "../../machine/eid/selectors.ts";

/**
 * This is the component that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen.
 *
 * @deprecated Superseded by the new `ItwDiscoveryInfoFallbackComponent`
 */
export const ItwDiscoveryInfoLegacyComponent = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const itwActivationDisabled = useIOSelector(itwIsActivationDisabledSelector);
  const { tos_url } = useIOSelector(tosConfigSelector);

  useOnFirstRender(
    useCallback(() => {
      machineRef.send({
        type: "start",
        mode: "issuance",
        level: "l2"
      });
    }, [machineRef])
  );

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t(
        "features.itWallet.discovery.screen.legacy.dismissalDialog.title"
      ),
      body: I18n.t(
        "features.itWallet.discovery.screen.legacy.dismissalDialog.body"
      ),
      confirmLabel: I18n.t(
        "features.itWallet.discovery.screen.legacy.dismissalDialog.confirm"
      ),
      cancelLabel: I18n.t(
        "features.itWallet.discovery.screen.legacy.dismissalDialog.cancel"
      )
    },
    dismissalContext: {
      screen_name: ITW_SCREENVIEW_EVENTS.ITW_INTRO,
      itw_flow: "L2"
    }
  });

  useHeaderSecondLevel({
    contextualHelp: emptyContextualHelp,
    supportRequest: true,
    title: "",
    goBack: () => {
      trackItwIntroBack("L2");
      dismissalDialog.show();
    }
  });

  const handleContinuePress = useCallback(() => {
    trackItWalletActivationStart("L2");
    machineRef.send({ type: "accept-tos" });
  }, [machineRef]);

  return (
    <IOScrollView
      includeContentMargins={false}
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
    >
      <AnimatedImage
        source={require("../../../../../img/features/itWallet/discovery/diw_hero.png")}
        style={styles.hero}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <H1>{I18n.t("features.itWallet.discovery.screen.legacy.title")}</H1>
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.screen.legacy.content")}
        />
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.screen.legacy.tos", {
            tos_url
          })}
          rules={generateItwIOMarkdownRules({ linkCallback: trackOpenItwTos })}
        />
      </ContentWrapper>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    height: "auto",
    resizeMode: "cover",
    aspectRatio: 4 / 3
  }
});
