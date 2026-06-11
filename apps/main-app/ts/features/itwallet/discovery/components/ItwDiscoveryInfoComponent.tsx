import {
  BodySmall,
  ContentWrapper,
  Divider,
  FooterActions,
  ForceScrollDownView,
  H2,
  H4,
  HStack,
  Icon,
  IOColors,
  IOIcons,
  useIOTheme,
  useIOThemeContext,
  useIOToast,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import Feature1Image from "../../../../../img/features/itWallet/discovery/feature_1.svg";
import Feature2Image from "../../../../../img/features/itWallet/discovery/feature_2.svg";
import Feature3Image from "../../../../../img/features/itWallet/discovery/feature_3.svg";
import Feature4Image from "../../../../../img/features/itWallet/discovery/feature_4.svg";
import Feature5Image from "../../../../../img/features/itWallet/discovery/feature_5.svg";
import { AnimatedImage } from "../../../../components/AnimatedImage.tsx";
import IOMarkdown from "../../../../components/IOMarkdown/index.tsx";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel.tsx";
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../store/hooks.ts";
import { emptyContextualHelp } from "../../../../utils/contextualHelp.ts";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet.tsx";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { trackOpenItwTos } from "../../analytics";
import { ITW_SCREENVIEW_EVENTS } from "../../analytics/enum.ts";
import { itwMixPanelCredentialDetailsSelector } from "../../analytics/store/selectors";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog.tsx";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/remoteConfig.ts";
import { generateItwIOMarkdownRules } from "../../common/utils/markdown.tsx";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors/index.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider.tsx";
import { selectIsLoading } from "../../machine/eid/selectors.ts";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import {
  trackItWalletActivationStart,
  trackItwDiscoveryPlus,
  trackItwIntroBack
} from "../analytics";

type Props = {
  credentialType?: string;
};

/**
 * This is the component that shows the information about the activation of
 * IT-Wallet. Must be used only for L3 activations.
 */
export const ItwDiscoveryInfoComponent = ({ credentialType }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isLoading = ItwEidIssuanceMachineContext.useSelector(selectIsLoading);
  const navigation = useIONavigation();
  const itwActivationDisabled = useIOSelector(itwIsActivationDisabledSelector);
  const isWalletValid = useIOSelector(itwLifecycleIsValidSelector);
  const mixPanelCredentialDetails = useIOSelector(
    itwMixPanelCredentialDetailsSelector
  );
  const toast = useIOToast();

  useOnFirstRender(
    useCallback(() => {
      machineRef.send({
        type: "start",
        mode: isWalletValid ? "upgrade" : "issuance",
        level: "l3",
        credentialType
      });
    }, [machineRef, isWalletValid, credentialType])
  );

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.title"
      ),
      body: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.body"
      ),
      confirmLabel: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.confirm"
      ),
      cancelLabel: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.cancel"
      )
    },
    dismissalContext: {
      screen_name: ITW_SCREENVIEW_EVENTS.ITW_INTRO,
      itw_flow: "L3"
    }
  });

  useHeaderSecondLevel({
    contextualHelp: emptyContextualHelp,
    supportRequest: true,
    title: "",
    goBack: () => {
      trackItwIntroBack("L3");
      dismissalDialog.show();
    },
    onStartSupportRequest: () => {
      toast.info(I18n.t("features.itWallet.generic.featureUnavailable.title"));
      return false;
    }
  });

  const handleContinuePress = useCallback(() => {
    trackItWalletActivationStart("L3", mixPanelCredentialDetails);
    machineRef.send({ type: "accept-tos" });
  }, [machineRef, mixPanelCredentialDetails]);

  const handleNavigateToPrivacyAndTerms = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.DISCOVERY.IPZS_PRIVACY
    });
  }, [navigation]);

  const {
    present: presentItwDetailsBottomSheet,
    bottomSheet: itwDetailsBottomSheet,
    dismiss: dismissItwDetailsBottomSheet
  } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.discovery.screen.itw.detailsBottomSheet.title"
    ),
    component: <ItwDetailsBottomSheetContent />,
    footer: (
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t(
              "features.itWallet.discovery.screen.itw.detailsBottomSheet.action"
            ),
            onPress: () => dismissItwDetailsBottomSheet()
          }
        }}
      />
    )
  });

  const handleOpenItwDetailsBottomSheet = useCallback(() => {
    trackItwDiscoveryPlus();
    presentItwDetailsBottomSheet();
  }, [presentItwDetailsBottomSheet]);

  return (
    <>
      <View style={styles.container} testID="itwDiscoveryInfoComponentTestID">
        <ForceScrollDownView
          footerActions={{
            actions: {
              type: "TwoButtons",
              primary: {
                loading: isLoading,
                disabled: itwActivationDisabled,
                label: I18n.t(
                  "features.itWallet.discovery.screen.itw.actions.primary"
                ),
                accessibilityLabel: I18n.t(
                  "features.itWallet.discovery.screen.itw.actions.primary"
                ),
                onPress: handleContinuePress
              },
              secondary: {
                label: I18n.t(
                  "features.itWallet.discovery.screen.itw.actions.secondary"
                ),
                accessibilityLabel: I18n.t(
                  "features.itWallet.discovery.screen.itw.actions.secondary"
                ),
                onPress: handleOpenItwDetailsBottomSheet
              }
            }
          }}
        >
          <HeroImage />
          <VSpacer size={24} />
          <ContentWrapper>
            <H2>{I18n.t("features.itWallet.discovery.screen.itw.title")}</H2>
            <VSpacer size={24} />
            <VStack space={16}>
              <FeatureBlock
                image={<Feature1Image width={48} height={48} />}
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.1"
                )}
              />
              <FeatureBlock
                image={<Feature2Image width={48} height={48} />}
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.2"
                )}
              />
              <FeatureBlock
                image={<Feature3Image width={48} height={48} />}
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.3"
                )}
              />
              <FeatureBlock
                image={<Feature4Image width={48} height={48} />}
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.4"
                )}
              />
              <FeatureBlock
                image={<Feature5Image width={48} height={48} />}
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.5"
                )}
              />
            </VStack>
            <VSpacer size={32} />
            <IOMarkdown
              content={I18n.t("features.itWallet.discovery.screen.itw.tos")}
              rules={generateItwIOMarkdownRules({
                linkCallback: trackOpenItwTos,
                onPress: handleNavigateToPrivacyAndTerms,
                paragraphSize: "small"
              })}
            />
          </ContentWrapper>
        </ForceScrollDownView>
      </View>
      {itwDetailsBottomSheet}
    </>
  );
};

const HeroImage = () => {
  const { themeType } = useIOThemeContext();
  return (
    <AnimatedImage
      source={
        themeType === "light"
          ? require("../../../../../img/features/itWallet/discovery/itw_hero.png")
          : require("../../../../../img/features/itWallet/discovery/itw_hero_dark.png")
      }
      style={styles.hero}
    />
  );
};

const FeatureBlock = (props: {
  content: string;
  image: React.ReactElement;
}) => {
  const theme = useIOTheme();

  return (
    <HStack
      space={16}
      style={{
        ...styles.feature,
        borderColor: IOColors[theme["cardBorder-default"]]
      }}
    >
      {props.image}
      <BodySmall style={{ flex: 1, flexWrap: "wrap" }}>
        {props.content}
      </BodySmall>
    </HStack>
  );
};

const ItwDetailsBottomSheetContent = () => (
  <>
    <DetailBlock
      title={I18n.t("features.itWallet.discovery.screen.itw.details.1.title")}
      content={I18n.t(
        "features.itWallet.discovery.screen.itw.details.1.content"
      )}
      icon="security"
    />
    <Divider />
    <DetailBlock
      title={I18n.t("features.itWallet.discovery.screen.itw.details.2.title")}
      content={I18n.t(
        "features.itWallet.discovery.screen.itw.details.2.content"
      )}
      icon="fiscalCodeIndividual"
    />
    <Divider />
    <DetailBlock
      title={I18n.t("features.itWallet.discovery.screen.itw.details.3.title")}
      content={I18n.t(
        "features.itWallet.discovery.screen.itw.details.3.content"
      )}
      icon="navQrWallet"
    />
    <Divider />
    <DetailBlock
      title={I18n.t("features.itWallet.discovery.screen.itw.details.4.title")}
      content={I18n.t(
        "features.itWallet.discovery.screen.itw.details.4.content"
      )}
      icon="euStars"
    />
  </>
);

const DetailBlock = (props: {
  title: string;
  content: string;
  icon: IOIcons;
}) => {
  const theme = useIOTheme();

  return (
    <VStack space={8} style={styles.detail}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <H4>{props.title}</H4>
        <Icon
          name={props.icon}
          size={24}
          color={theme["interactiveElem-default"]}
        />
      </View>
      <IOMarkdown content={props.content} />
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  hero: {
    width: "100%",
    height: "auto",
    resizeMode: "cover",
    aspectRatio: 4 / 3
  },
  feature: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderCurve: "continuous"
  },
  detail: {
    paddingVertical: 16
  }
});
