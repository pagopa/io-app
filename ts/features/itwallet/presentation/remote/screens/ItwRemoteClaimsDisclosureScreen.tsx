import {
  Alert,
  ButtonLink,
  ClaimsSelector,
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  H2,
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
import { ItwRemoteMachineContext } from "../machine/provider.tsx";
import {
  selectIsLoading,
  selectPresentationDetails
} from "../machine/selectors.ts";
import { useIODispatch } from "../../../../../store/hooks.ts";
import { identificationRequest } from "../../../../../store/actions/identification.ts";
import { ItwRemoteLoadingScreen } from "../components/ItwRemoteLoadingScreen.tsx";

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

const mapDisclosuresToClaims = (
  disclosures: Array<[string, string, unknown]>
) =>
  disclosures.map(([, name, value]) => ({
    id: name,
    title: value as string,
    description: name
  }));

const ItwRemoteClaimsDisclosureScreen = () => {
  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  const isLoading = ItwRemoteMachineContext.useSelector(selectIsLoading);

  if (isLoading) {
    return (
      <ItwRemoteLoadingScreen title="Stiamo facendo alcune verifiche di sicurezza" />
    );
  }

  return <ContentView />;
};

/**
 * The actual content of the screen, with the claims to disclose for the verifiable presentation.
 */
const ContentView = () => {
  const dispatch = useIODispatch();

  useHeaderSecondLevel({ title: "" });

  const theme = useIOTheme();
  const presentationDetails = ItwRemoteMachineContext.useSelector(
    selectPresentationDetails
  );
  const machineRef = ItwRemoteMachineContext.useActorRef();

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

  const confirmVerifiablePresentation = () =>
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: () => machineRef.send({ type: "holder-consent" })
        }
      )
    );

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
      {/* <ClaimsSelector
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
      /> */}
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
            onPress: confirmVerifiablePresentation
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
            {presentationDetails?.map(c => (
              <ClaimsSelector
                key={c.id}
                title={c.id}
                defaultExpanded
                selectionEnabled={false}
                items={mapDisclosuresToClaims(c.requiredDisclosures)}
              />
            ))}
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
