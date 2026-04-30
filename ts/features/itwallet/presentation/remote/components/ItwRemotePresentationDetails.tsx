import {
  Alert,
  ClaimsSelector,
  ListItemCheckbox,
  ListItemHeader,
  VSpacer,
  VStack,
  useIOTheme,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo, useMemo } from "react";
import { View } from "react-native";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { getCredentialCardConfig } from "../../../common/components/ItwCredentialCard/config";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import { useItWalletTheme } from "../../../common/utils/theme";
import { useClaimsDetailsBottomSheet } from "../../common/hooks/useClaimsDetailsBottomSheet";
import { mapClaimsToClaimsSelectorItems } from "../../common/utils/itwClaimSelector";
import { ItwRemoteMachineContext } from "../machine/provider";
import { selectPresentationDetails } from "../machine/selectors";
import {
  getCredentialTypeByVct,
  groupCredentialsByPurpose
} from "../utils/itwRemotePresentationUtils";
import { EnrichedPresentationDetails } from "../utils/itwRemoteTypeUtils";

const RequestedCredentialsBlock = ({
  credentials
}: {
  credentials: EnrichedPresentationDetails;
}) => {
  const { themeType } = useIOThemeContext();
  const itwTheme = useItWalletTheme();
  const { present, bottomSheet } = useClaimsDetailsBottomSheet();

  return (
    <VStack space={24}>
      {credentials
        .filter(c => c.format === "dc+sd-jwt") // TODO: [SIW-3998] Support MDOC remote presentation
        .filter(c => c.claimsToDisplay.length > 0)
        .map(c => {
          const credentialType = getCredentialTypeByVct(c.vct);
          if (!credentialType) {
            // Should never happen
            return null;
          }

          const config = getCredentialCardConfig(credentialType, themeType);

          return (
            <ClaimsSelector
              key={c.id}
              title={getCredentialNameFromType(credentialType, true)}
              items={mapClaimsToClaimsSelectorItems(c.claimsToDisplay, present)}
              defaultExpanded
              selectionEnabled={false}
              headerGradientColors={[
                itwTheme["card-background"],
                config.background.colors[0]
              ]}
            />
          );
        })}
      {bottomSheet}
    </VStack>
  );
};

const ItwRemotePresentationDetails = () => {
  const theme = useIOTheme();

  const machineRef = ItwRemoteMachineContext.useActorRef();
  const presentationDetails = ItwRemoteMachineContext.useSelector(
    selectPresentationDetails
  );

  useDebugInfo({ presentationDetails });

  const { required, optional } = useMemo(
    () => groupCredentialsByPurpose(presentationDetails ?? []),
    [presentationDetails]
  );

  const sendCredentialsToMachine = (
    credentials: EnrichedPresentationDetails
  ) => {
    machineRef.send({
      type: "toggle-credential",
      credentialIds: credentials.map(c => c.id)
    });
  };

  return (
    <VStack space={24}>
      {required.map(({ purpose, credentials }) => (
        <View key={`required:${purpose}`}>
          <ListItemHeader
            label={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.requiredClaims"
            )}
            iconName="security"
            iconColor={theme["icon-decorative"]}
            description={
              purpose
                ? I18n.t("features.itWallet.presentation.remote.purpose", {
                    purpose
                  })
                : undefined
            }
          />
          <RequestedCredentialsBlock credentials={credentials} />
        </View>
      ))}

      {optional.map(({ purpose, credentials }) => (
        <View key={`optional:${purpose}`}>
          <ListItemCheckbox
            value={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.optionalClaims"
            )}
            icon="security"
            onValueChange={() => sendCredentialsToMachine(credentials)}
            description={
              purpose
                ? I18n.t("features.itWallet.presentation.remote.purpose", {
                    purpose
                  })
                : undefined
            }
          />
          <RequestedCredentialsBlock credentials={credentials} />
          <VSpacer size={16} />
          <Alert
            variant="info"
            content={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.optionalClaimsAlert"
            )}
          />
        </View>
      ))}
    </VStack>
  );
};

const MemoizedItwRemotePresentationDetails = memo(ItwRemotePresentationDetails);

export { MemoizedItwRemotePresentationDetails as ItwRemotePresentationDetails };
