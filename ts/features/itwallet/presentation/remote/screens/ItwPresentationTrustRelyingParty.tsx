import {
  Alert,
  ButtonLink,
  ContentWrapper,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  ListItemHeader,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import { memo, useState } from "react";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import Animated, {
  LinearTransition,
  FadeIn,
  FadeOut
} from "react-native-reanimated";
import { ItwDataExchangeIcons } from "../../../common/components/ItwDataExchangeIcons";
import IOMarkdown from "../../../../../components/IOMarkdown";
import I18n from "../../../../../i18n";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  ItwOptionalClaimsList,
  ItwRequiredClaimsList,
  ConsentClaim
} from "../../../common/components/ItwConsentClaims";

const RP_MOCK_NAME = "Comune di Milano";

const mockedRequiredClaims: Array<ConsentClaim> = [
  {
    claim: { id: "fiscal_code", label: "Codice fiscale", value: "QWERTYUIOP" },
    source: "IPZS"
  },
  {
    claim: { id: "name", label: "Nome", value: "Mario" },
    source: "IPZS"
  },
  {
    claim: { id: "surname", label: "Cognome", value: "Rossi" },
    source: "IPZS"
  }
];

const mockedOptionalClaims: Array<ConsentClaim> = [
  {
    claim: { id: "birthdate", label: "Data di nascita", value: "01/01/1970" },
    source: "IPZS"
  },
  {
    claim: { id: "city", label: "Città", value: "Roma" },
    source: "IPZS"
  }
];

const ItwMemoizedRequiredClaimsList = memo(ItwRequiredClaimsList);

export const ItwPresentationTrustRelyingParty = () => {
  const [selectedOptionalClaims, setSelectedOptionalClaims] = useState<
    Array<string>
  >([]);
  const allOptionalClaimsSelected =
    selectedOptionalClaims.length === mockedOptionalClaims.length;

  const toggleOptionalClaims = (claimId: string) => {
    setSelectedOptionalClaims(prevState =>
      prevState.includes(claimId)
        ? prevState.filter(id => id !== claimId)
        : [...prevState, claimId]
    );
  };

  const toggleSelectAll = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    setSelectedOptionalClaims(
      allOptionalClaimsSelected ? [] : mockedOptionalClaims.map(c => c.claim.id)
    );
  };

  useHeaderSecondLevel({ title: "" });

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
            onPress={toggleSelectAll}
          />
        </View>
      </View>
      <ItwOptionalClaimsList
        items={mockedOptionalClaims}
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
          <H2>
            {I18n.t("features.itWallet.presentation.selectiveDisclosure.title")}
          </H2>
        </VStack>
        <VSpacer size={16} />
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.presentation.selectiveDisclosure.subtitle",
            {
              relyingParty: RP_MOCK_NAME
            }
          )}
        />
        <VSpacer size={24} />

        <VStack space={24}>
          <View>
            <ListItemHeader
              label={I18n.t(
                "features.itWallet.presentation.selectiveDisclosure.requiredClaims"
              )}
              iconName="security"
              iconColor="grey-700"
            />
            <ItwMemoizedRequiredClaimsList items={mockedRequiredClaims} />
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
              { privacyUrl: "https://rp.privacy.url" }
            )}
          />
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

const styles = StyleSheet.create({
  claimsSelection: {
    marginLeft: "auto"
  }
});
