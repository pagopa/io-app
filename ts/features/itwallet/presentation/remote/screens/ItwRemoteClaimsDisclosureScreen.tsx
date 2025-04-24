import {
  Alert,
  ClaimsSelector,
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  H2,
  IOButton,
  ListItemHeader,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { ComponentProps, useState } from "react";
import { View } from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import IOMarkdown from "../../../../../components/IOMarkdown/index.tsx";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import I18n from "../../../../../i18n";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { useAvoidHardwareBackButton } from "../../../../../utils/useAvoidHardwareBackButton.ts";
import { ItwDataExchangeIcons } from "../../../common/components/ItwDataExchangeIcons.tsx";
import { useItwDisableGestureNavigation } from "../../../common/hooks/useItwDisableGestureNavigation.ts";
import { DisclosureClaim } from "../../../common/utils/itwClaimsUtils.ts";
import { ItwRemotePresentationClaimsMock } from "../../../common/utils/itwMocksUtils.ts";

type ClaimItem = ComponentProps<typeof ClaimsSelector>["items"][number];

const RP_MOCK_NAME = "Comune di Milano";
const RP_MOCK_PRIVACY_URL = "https://rp.privacy.url";

const mapMockClaims = (claims: Array<DisclosureClaim>, missing = false) =>
  claims.map(
    ({ claim }): ClaimItem => ({
      id: claim.id,
      title: missing ? "-" : (claim.value as string),
      description: claim.label
    })
  );

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

  const theme = useIOTheme();

  const [selectedOptionalClaims, setSelectedOptionalClaims] = useState<
    Array<string>
  >([]);
  const allOptionalClaimsSelected =
    selectedOptionalClaims.length ===
    ItwRemotePresentationClaimsMock.optional.length;

  const toggleOptionalClaims = (claim: ClaimItem) => {
    setSelectedOptionalClaims(prevState =>
      prevState.includes(claim.id)
        ? prevState.filter(id => id !== claim.id)
        : [...prevState, claim.id]
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
          iconColor={theme["icon-default"]}
        />
        <View style={{ alignSelf: "flex-end" }}>
          <IOButton
            variant="link"
            label={I18n.t(
              `global.buttons.${
                allOptionalClaimsSelected ? "deselectAll" : "selectAll"
              }`
            )}
            onPress={toggleAllOptionalClaims}
          />
        </View>
      </View>
      <ClaimsSelector
        title="Patente di guida"
        items={mapMockClaims(ItwRemotePresentationClaimsMock.optional)}
        selectedItemIds={selectedOptionalClaims}
        onItemSelected={toggleOptionalClaims}
        defaultExpanded
      />
      <ClaimsSelector
        title="Credenziale mancante"
        items={mapMockClaims(ItwRemotePresentationClaimsMock.optional, true)}
        selectionEnabled={false}
        defaultExpanded
      />
      <Alert
        variant="info"
        content={I18n.t(
          "features.itWallet.presentation.selectiveDisclosure.optionalClaimsAlert"
        )}
      />
      <Alert
        variant="warning"
        content={I18n.t(
          "features.itWallet.presentation.selectiveDisclosure.missingClaimsAlert"
        )}
      />
    </VStack>
  );

  return (
    <ForceScrollDownView
      footerActions={{
        actions: {
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: () => null // TODO
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: () => null // TODO
          }
        }
      }}
    >
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
              iconColor={theme["icon-default"]}
            />
            <ClaimsSelector
              title="Identità digitale"
              selectionEnabled={false}
              items={mapMockClaims(ItwRemotePresentationClaimsMock.required)}
            />
          </View>

          {renderOptionalClaims()}

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
        </VStack>
      </ContentWrapper>
    </ForceScrollDownView>
  );
};

export { ItwRemoteClaimsDisclosureScreen };
