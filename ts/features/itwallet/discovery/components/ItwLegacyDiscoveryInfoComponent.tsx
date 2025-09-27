import { ContentWrapper, H1, VSpacer } from "@pagopa/io-app-design-system";
import { StyleSheet } from "react-native";
import I18n from "i18next";
import { useCallback } from "react";
import { AnimatedImage } from "../../../../components/AnimatedImage.tsx";
import IOMarkdown from "../../../../components/IOMarkdown/index.tsx";
import { useIOSelector } from "../../../../store/hooks.ts";
import { tosConfigSelector } from "../../../tos/store/selectors/index.ts";
import { trackItwIntroBack, trackOpenItwTos } from "../../analytics/index.ts";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/remoteConfig.ts";
import { selectIsLoading } from "../../machine/eid/selectors.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider.tsx";
import { generateItwIOMarkdownRules } from "../../common/utils/markdown.tsx";
import { IOScrollView } from "../../../../components/ui/IOScrollView.tsx";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel.tsx";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp.tsx";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog.tsx";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";

export type ItwDiscoveryInfoComponentProps = {
  onContinuePress: () => void;
};

/**
 * This is the component that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen.
 *
 * @deprecated Superseded by the new `ItwDiscoveryInfoComponent`
 */
export const ItwLegacyDiscoveryInfoComponent = ({
  onContinuePress
}: ItwDiscoveryInfoComponentProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const itwActivationDisabled = useIOSelector(itwIsActivationDisabledSelector);
  const { tos_url } = useIOSelector(tosConfigSelector);

  useOnFirstRender(
    useCallback(() => {
      machineRef.send({
        type: "start",
        isL3: false
      });
    }, [machineRef])
  );

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t("features.itWallet.discovery.dismissalDialog.title"),
      body: I18n.t("features.itWallet.discovery.dismissalDialog.body"),
      confirmLabel: I18n.t(
        "features.itWallet.discovery.dismissalDialog.confirm"
      ),
      cancelLabel: I18n.t("features.itWallet.discovery.dismissalDialog.cancel")
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
          onPress: onContinuePress
        }
      }}
    >
      <AnimatedImage
        source={require("../../../../../img/features/itWallet/discovery/itw_hero.png")}
        style={styles.hero}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <H1>{I18n.t("features.itWallet.discovery.legacy.title")}</H1>
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.legacy.content")}
        />
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.tos", {
            tos_url
          })}
          rules={generateItwIOMarkdownRules({ linkCallback: trackOpenItwTos })}
        />
      </ContentWrapper>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  hero: { resizeMode: "cover", width: "100%" }
});
