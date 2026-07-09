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
  IOMarkdownLite,
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
import { useIOSelector } from "../../../../store/hooks.ts";
import { emptyContextualHelp } from "../../../../utils/contextualHelp.ts";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet.tsx";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { trackOpenItwTos } from "../../analytics";
import { itwMixPanelCredentialDetailsSelector } from "../../analytics/store/selectors";
import { itwIsActivationDisabledSelector } from "../../common/store/selectors/remoteConfig.ts";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors/index.ts";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider.tsx";
import { selectIsLoading } from "../../machine/eid/selectors.ts";
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

  useHeaderSecondLevel({
    contextualHelp: emptyContextualHelp,
    supportRequest: true,
    title: "",
    goBack: () => {
      trackItwIntroBack("L3");
      machineRef.send({ type: "close", surveyStep: "intro" });
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

  const handlePrivacyAndTermsPress = useCallback(() => {
    trackOpenItwTos();
    machineRef.send({ type: "go-to-ipzs-privacy" });
  }, [machineRef]);

  const {
    present: presentItwDetailsBottomSheet,
    bottomSheet: itwDetailsBottomSheet,
    dismiss: dismissItwDetailsBottomSheet
  } = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.discovery.screen.itw.detailsBottomSheet.title"
    ),
    component: (
      <>
        <DetailBlock
          content={I18n.t(
            "features.itWallet.discovery.screen.itw.details.1.content"
          )}
          icon="security"
          title={I18n.t(
            "features.itWallet.discovery.screen.itw.details.1.title"
          )}
        />
        <Divider />
        <DetailBlock
          content={I18n.t(
            "features.itWallet.discovery.screen.itw.details.2.content"
          )}
          icon="fiscalCodeIndividual"
          title={I18n.t(
            "features.itWallet.discovery.screen.itw.details.2.title"
          )}
        />
        <Divider />
        <DetailBlock
          content={I18n.t(
            "features.itWallet.discovery.screen.itw.details.3.content"
          )}
          icon="navQrWallet"
          title={I18n.t(
            "features.itWallet.discovery.screen.itw.details.3.title"
          )}
        />
        <Divider />
        <DetailBlock
          content={I18n.t(
            "features.itWallet.discovery.screen.itw.details.4.content"
          )}
          icon="euStars"
          title={I18n.t(
            "features.itWallet.discovery.screen.itw.details.4.title"
          )}
        />
      </>
    ),
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
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.1"
                )}
                image={<Feature1Image height={48} width={48} />}
              />
              <FeatureBlock
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.2"
                )}
                image={<Feature2Image height={48} width={48} />}
              />
              <FeatureBlock
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.3"
                )}
                image={<Feature3Image height={48} width={48} />}
              />
              <FeatureBlock
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.4"
                )}
                image={<Feature4Image height={48} width={48} />}
              />
              <FeatureBlock
                content={I18n.t(
                  "features.itWallet.discovery.screen.itw.features.5"
                )}
                image={<Feature5Image height={48} width={48} />}
              />
            </VStack>
            <VSpacer size={32} />
            <IOMarkdownLite
              content={I18n.t("features.itWallet.discovery.screen.itw.tos", {
                privacyUrl: "itw-privacy-and-terms"
              })}
              onLinkPress={handlePrivacyAndTermsPress}
              small
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

const DetailBlock = (props: {
  content: string;
  icon: IOIcons;
  title: string;
}) => {
  const theme = useIOTheme();

  return (
    <VStack space={8} style={styles.detail}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <H4>{props.title}</H4>
        <Icon
          color={theme["interactiveElem-default"]}
          name={props.icon}
          size={24}
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
