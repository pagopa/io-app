import {
  BodySmall,
  ContentWrapper,
  FeatureInfo,
  H3,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { AnimatedImage } from "../../../../components/AnimatedImage.tsx";
import IOMarkdown from "../../../../components/IOMarkdown/index.tsx";
import { IOScrollView } from "../../../../components/ui/IOScrollView.tsx";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel.tsx";
import { useIOSelector } from "../../../../store/hooks.ts";
import { emptyContextualHelp } from "../../../../utils/contextualHelp.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { tosConfigSelector } from "../../../tos/store/selectors/index.ts";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum.ts";
import { itwMixPanelCredentialDetailsSelector } from "../../analytics/store/selectors";
import { trackItWalletActivationStart, trackItwIntroBack } from "../analytics";
import { trackOpenItwTos } from "../../analytics";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog.tsx";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/remoteConfig.ts";
import { generateItwIOMarkdownRules } from "../../common/utils/markdown.tsx";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider.tsx";
import { selectIsLoading } from "../../machine/eid/selectors.ts";

/**
 * This is the component that shows the information about about the activation of
 * Documenti su IO after an user chooses to not use IT-WAllet
 */
export const ItwDiscoveryInfoFallbackComponent = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const itwActivationDisabled = useIOSelector(itwIsActivationDisabledSelector);
  const { tos_url } = useIOSelector(tosConfigSelector);
  const mixPanelCredentialDetails = useIOSelector(
    itwMixPanelCredentialDetailsSelector
  );

  useOnFirstRender(
    useCallback(() => {
      machineRef.send({
        type: "start",
        mode: "issuance",
        level: "l2-fallback"
      });
    }, [machineRef])
  );

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t(
        "features.itWallet.discovery.screen.diw.dismissalDialog.title"
      ),
      body: I18n.t(
        "features.itWallet.discovery.screen.diw.dismissalDialog.body"
      ),
      confirmLabel: I18n.t(
        "features.itWallet.discovery.screen.diw.dismissalDialog.confirm"
      ),
      cancelLabel: I18n.t(
        "features.itWallet.discovery.screen.diw.dismissalDialog.cancel"
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
    trackItWalletActivationStart("L2", mixPanelCredentialDetails);
    machineRef.send({ type: "accept-tos" });
  }, [machineRef, mixPanelCredentialDetails]);

  return (
    <IOScrollView
      testID="itwDiscoveryInfoFallbackComponentTestID"
      includeContentMargins={false}
      actions={{
        type: "SingleButton",
        primary: {
          loading: isLoading,
          disabled: itwActivationDisabled,
          label: I18n.t(
            "features.itWallet.discovery.screen.diw.actions.primary"
          ),
          accessibilityLabel: I18n.t(
            "features.itWallet.discovery.screen.diw.actions.primary"
          ),
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
        <VStack space={8}>
          <H3 style={styles.textCenter}>
            {I18n.t("features.itWallet.discovery.screen.diw.title")}
          </H3>
          <BodySmall style={styles.textCenter}>
            {I18n.t("features.itWallet.discovery.screen.diw.content")}
          </BodySmall>
        </VStack>
        <VSpacer size={24} />
        <VStack space={24}>
          <FeatureInfo
            pictogramProps={{ name: "timing" }}
            body={I18n.t(
              "features.itWallet.discovery.screen.diw.featureHighlights.1"
            )}
          />
          <FeatureInfo
            pictogramProps={{ name: "itWallet" }}
            body={I18n.t(
              "features.itWallet.discovery.screen.diw.featureHighlights.2"
            )}
          />
          <FeatureInfo
            pictogramProps={{ name: "cie" }}
            body={I18n.t(
              "features.itWallet.discovery.screen.diw.featureHighlights.3"
            )}
          />
        </VStack>
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.discovery.screen.diw.contentBottom"
          )}
        />
        <VSpacer size={24} />
        <IOMarkdown
          content={I18n.t("features.itWallet.discovery.screen.diw.tos", {
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
  hero: {
    width: "100%",
    height: "auto",
    resizeMode: "cover",
    aspectRatio: 4 / 3
  },
  textCenter: { textAlign: "center" }
});
