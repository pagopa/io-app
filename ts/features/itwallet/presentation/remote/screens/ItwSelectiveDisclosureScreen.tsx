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
import { ItwDataExchangeIcons } from "../../../common/components/ItwDataExchangeIcons";
import IOMarkdown from "../../../../../components/IOMarkdown";
import I18n from "../../../../../i18n";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import {
  ItwRequestedClaimsList,
  ItwSelectableClaimList,
  RequiredClaim
} from "../../../issuance/components/ItwRequiredClaimsList";

const RP_MOCK_NAME = "Comune di Milano";

const mockedRequiredClaims: Array<RequiredClaim> = [
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

const mockedOptionalClaims: Array<RequiredClaim> = [
  {
    claim: { id: "birthdate", label: "Data di nascita", value: "11/11/11" },
    source: "IPZS"
  },
  {
    claim: { id: "city", label: "Città", value: "Roma" },
    source: "IPZS"
  }
];

const ItwMemoizedRequestedClaimsList = memo(ItwRequestedClaimsList);

export const ItwSelectiveDisclosureScreen = () => {
  const [selectedClaimIds, setSelectedClaimIds] = useState<Array<string>>([]);
  const allSelected = selectedClaimIds.length === mockedOptionalClaims.length;

  const toggleOptionalClaims = (claimId: string) => {
    if (selectedClaimIds.includes(claimId)) {
      setSelectedClaimIds(prev => prev.filter(id => id !== claimId));
    } else {
      setSelectedClaimIds(prev => [...prev, claimId]);
    }
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedClaimIds([]);
    } else {
      setSelectedClaimIds(mockedOptionalClaims.map(c => c.claim.id));
    }
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
              `global.buttons.${allSelected ? "deselectAll" : "selectAll"}`
            )}
            onPress={toggleSelectAll}
          />
        </View>
      </View>
      <ItwSelectableClaimList
        items={mockedOptionalClaims}
        selectedIds={selectedClaimIds}
        onSelectionChange={toggleOptionalClaims}
      />
      {!allSelected && (
        <Alert
          variant="info"
          content={I18n.t(
            "features.itWallet.presentation.selectiveDisclosure.optionalClaimsAlert"
          )}
        />
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
            <ItwMemoizedRequestedClaimsList items={mockedRequiredClaims} />
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
              {
                privacyUrl: "https://rp.privacy.url"
              }
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
