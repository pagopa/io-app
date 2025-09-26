import {
  BodySmall,
  ContentWrapper,
  FeatureInfo,
  H3,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { StyleSheet } from "react-native";
import I18n from "i18next";
import { constNull } from "fp-ts/lib/function";
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
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum";

export type ItwDiscoveryInfoComponentProps = {
  onContinuePress: () => void;
};

/**
 * This is the component that shows the information about the discovery process
 * about the activation of the DIW. It uses a markdown component to render
 * the content of the screen.
 */
export const ItwDiscoveryInfoComponent = () => {
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const itwActivationDisabled = useIOSelector(itwIsActivationDisabledSelector);
  const { tos_url } = useIOSelector(tosConfigSelector);

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
          label: I18n.t("features.itWallet.discovery.actions.continue"),
          accessibilityLabel: I18n.t(
            "features.itWallet.discovery.actions.continue"
          ),
          onPress: constNull
        }
      }}
    >
      <AnimatedImage
        source={require("../../../../../img/features/itWallet/discovery/itw_hero.png")}
        style={styles.hero}
      />
      <VSpacer size={24} />
      <ContentWrapper>
        <VStack space={8}>
          <H3 style={styles.textCenter}>
            {I18n.t("features.itWallet.discovery.title")}
          </H3>
          <BodySmall style={styles.textCenter}>
            {I18n.t("features.itWallet.discovery.content")}
          </BodySmall>
        </VStack>
        <VSpacer size={24} />
        <VStack space={24}>
          <FeatureInfo
            pictogramProps={{ name: "timing" }}
            body={I18n.t("features.itWallet.discovery.featureHighlights.1")}
          />
          <FeatureInfo
            pictogramProps={{ name: "itWallet" }}
            body={I18n.t("features.itWallet.discovery.featureHighlights.2")}
          />
          <FeatureInfo
            pictogramProps={{ name: "cie" }}
            body={I18n.t("features.itWallet.discovery.featureHighlights.3")}
          />
        </VStack>
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.contentBottom")}
        />
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.tos", {
            tos_url
          })}
          rules={generateItwIOMarkdownRules({
            linkCallback: trackOpenItwTos,
            paragraphSize: "small"
          })}
        />
      </ContentWrapper>
    </IOScrollView>
  );
};

const styles = StyleSheet.create({
  hero: { resizeMode: "cover", width: "100%" },
  textCenter: { textAlign: "center" }
});
