import {
  Alert,
  ButtonLink,
  ContentWrapper,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  ListItemHeader,
  VStack
} from "@pagopa/io-app-design-system";
import { View, StyleSheet } from "react-native";
import { memo, useState } from "react";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";
import I18n from "../../../../../i18n";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import { ItwRemotePresentationClaimsMock } from "../../../common/utils/itwMocksUtils.ts";
import {
  ItwOptionalClaimsList,
  ItwRequiredClaimsList
} from "../../../common/components/ItwClaimsDisclosure/index.tsx";
import { ItwDataExchangeIcons } from "../../../common/components/ItwDataExchangeIcons.tsx";
import IOMarkdown from "../../../../../components/IOMarkdown/index.tsx";

const RP_MOCK_NAME = "Comune di Milano";
const RP_MOCK_PRIVACY_URL = "https://rp.privacy.url";

const ItwRemoteClaimsDisclosureScreen = () => {
  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  return <ContentView />;
};

/**
 * The actual content of the screen, with the claims to disclose for the verifiable presentation.
 */
const ContentView = () => {
  useHeaderSecondLevel({ title: "" });

  const [selectedOptionalClaims, setSelectedOptionalClaims] = useState<
    Array<string>
  >([]);
  const allOptionalClaimsSelected =
    selectedOptionalClaims.length ===
    ItwRemotePresentationClaimsMock.optional.length;

  const toggleOptionalClaims = (claimId: string) => {
    setSelectedOptionalClaims(prevState =>
      prevState.includes(claimId)
        ? prevState.filter(id => id !== claimId)
        : [...prevState, claimId]
    );
  };

  const toggleAllOptionalClaims = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setSelectedOptionalClaims(
      allOptionalClaimsSelected
        ? []
        : ItwRemotePresentationClaimsMock.optional.map(c => c.claim.id)
    );
  };

  const renderOptionalClaims = () => (
    <VStack space={16}>
      <View>
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.presentation.selectiveDisclosure.optionalClaims"
          )}
          iconName="security"
          iconColor="grey-700"
        />
        <View style={styles.claimsSelection}>
          <ButtonLink
            label={I18n.t(
              `global.buttons.${
                allOptionalClaimsSelected ? "deselectAll" : "selectAll"
              }`
            )}
            onPress={toggleAllOptionalClaims}
          />
        </View>
      </View>
      <ItwOptionalClaimsList
        items={ItwRemotePresentationClaimsMock.optional}
        selectedClaims={selectedOptionalClaims}
        onSelectionChange={toggleOptionalClaims}
      />
      {!allOptionalClaimsSelected && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          layout={LinearTransition.duration(200)}
        >
          <Alert
            variant="info"
            content={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.optionalClaimsAlert"
            )}
          />
        </Animated.View>
      )}
    </VStack>
  );

  return (
    <ForceScrollDownView>
      <ContentWrapper>
        <VStack space={24}>
          <ItwDataExchangeIcons
            requesterLogoUri={require("../../../../../../img/features/itWallet/issuer/IPZS.png")} // TODO: get the Relying Party logo
          />

          <VStack space={8}>
            <H2>
              {I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.title"
              )}
            </H2>
            <IOMarkdown
              content={I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.subtitle",
                { relyingParty: RP_MOCK_NAME }
              )}
            />
          </VStack>

          <View>
            <ListItemHeader
              label={I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.requiredClaims"
              )}
              iconName="security"
              iconColor="grey-700"
            />
            <ItwMemoizedRequiredClaimsList
              items={ItwRemotePresentationClaimsMock.required}
            />
          </View>

          {renderOptionalClaims()}

          <Animated.View
            style={styles.animatedContainer}
            layout={LinearTransition.duration(200)}
          >
            <FeatureInfo
              iconName="fornitori"
              body={I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.disclaimer.0"
              )}
            />
            <FeatureInfo
              iconName="trashcan"
              body={I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.disclaimer.1"
              )}
            />
            <IOMarkdown
              content={I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.tos",
                { privacyUrl: RP_MOCK_PRIVACY_URL }
              )}
            />
          </Animated.View>
        </VStack>
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: () => null // TODO
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: () => null // TODO
          }
        }}
      />
    </ForceScrollDownView>
  );
};

const ItwMemoizedRequiredClaimsList = memo(ItwRequiredClaimsList);

const styles = StyleSheet.create({
  claimsSelection: {
    marginLeft: "auto"
  },
  animatedContainer: {
    gap: 24
  }
});

export { ItwRemoteClaimsDisclosureScreen };
