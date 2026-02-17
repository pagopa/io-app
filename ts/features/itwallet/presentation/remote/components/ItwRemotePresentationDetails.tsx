import { memo, useMemo } from "react";
import { View } from "react-native";
import {
  Alert,
  ClaimsSelector,
  ListItemCheckbox,
  ListItemHeader,
  VSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import { selectPresentationDetails } from "../machine/selectors";
import { ItwRemoteMachineContext } from "../machine/provider";
import { EnrichedPresentationDetails } from "../utils/itwRemoteTypeUtils";
import {
  getCredentialTypeByVct,
  groupCredentialsByPurpose
} from "../utils/itwRemotePresentationUtils";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { useClaimsDetailsBottomSheet } from "../../common/hooks/useClaimsDetailsBottomSheet";
import {
  claimsSelectorHeaderGradientsByCredentialType,
  mapClaimsToClaimsSelectorItems
} from "../../common/utils/itwClaimSelector";

const RequestedCredentialsBlock = ({
  credentials
}: {
  credentials: EnrichedPresentationDetails;
}) => {
  const { present, bottomSheet } = useClaimsDetailsBottomSheet();

  return (
    <VStack space={24}>
      {credentials
        .filter(c => c.claimsToDisplay.length > 0)
        .map(c => {
          const credentialType = getCredentialTypeByVct(c.vct);

          const title = credentialType
            ? getCredentialNameFromType(credentialType, "", true)
            : "";

          const headerGradientColors = credentialType
            ? claimsSelectorHeaderGradientsByCredentialType[credentialType]
            : undefined;

          return (
            <ClaimsSelector
              key={c.id}
              title={title}
              items={mapClaimsToClaimsSelectorItems(c.claimsToDisplay, present)}
              defaultExpanded
              selectionEnabled={false}
              headerGradientColors={headerGradientColors}
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
