import { ContentWrapper, H1, VSpacer } from "@pagopa/io-app-design-system";
import { StyleSheet } from "react-native";
import { AnimatedImage } from "../../../../components/AnimatedImage.tsx";
import IOMarkdown from "../../../../components/IOMarkdown/index.tsx";
import I18n from "../../../../i18n.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { tosConfigSelector } from "../../../tos/store/selectors/index.ts";
import { trackOpenItwTos } from "../../analytics/index.ts";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/remoteConfig.ts";
import { selectIsLoading } from "../../machine/eid/selectors.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/provider.tsx";
import { generateLinkRuleWithCallback } from "../../common/utils/markdown.tsx";
import { IOScrollView } from "../../../../components/ui/IOScrollView.tsx";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel.tsx";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp.tsx";

export type ItwDiscoveryInfoComponentProps = {
  onContinuePress: () => void;
};

/**
 * This is the component that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen. The screen is wrapped in a GradientScrollView
 * with a primary and secondary action.
 */
export const ItwDiscoveryInfoComponent = ({
  onContinuePress
}: ItwDiscoveryInfoComponentProps) => {
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const itwActivationDisabled = useIOSelector(itwIsActivationDisabledSelector);
  const { tos_url } = useIOSelector(tosConfigSelector);

  useHeaderSecondLevel({
    contextualHelp: emptyContextualHelp,
    supportRequest: true,
    title: ""
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
        <H1>{I18n.t("features.itWallet.discovery.title")}</H1>
        <VSpacer size={24} />
        <IOMarkdown content={I18n.t("features.itWallet.discovery.content")} />
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.tos", {
            tos_url
          })}
          rules={generateLinkRuleWithCallback(trackOpenItwTos)}
        />
      </ContentWrapper>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  hero: { resizeMode: "cover", width: "100%" }
});
