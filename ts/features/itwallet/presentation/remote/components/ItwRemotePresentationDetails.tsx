import {
  Alert,
  ClaimsSelector,
  ListItemCheckbox,
  ListItemHeader,
  useIOTheme,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo, useMemo } from "react";
import { View } from "react-native";

import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import { useClaimsDetailsBottomSheet } from "../../common/hooks/useClaimsDetailsBottomSheet";
import {
  claimsSelectorHeaderGradientsByCredentialType,
  mapClaimsToClaimsSelectorItems
} from "../../common/utils/itwClaimSelector";
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
  const { present, bottomSheet } = useClaimsDetailsBottomSheet();

  return (
    <VStack space={24}>
      {credentials
        .filter(c => c.format === "dc+sd-jwt") // TODO: [SIW-3998] Support MDOC remote presentation
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
              defaultExpanded
              headerGradientColors={headerGradientColors}
              items={mapClaimsToClaimsSelectorItems(c.claimsToDisplay, present)}
              key={c.id}
              selectionEnabled={false}
              title={title}
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
            description={
              purpose
                ? I18n.t("features.itWallet.presentation.remote.purpose", {
                    purpose
                  })
                : undefined
            }
            iconColor={theme["icon-decorative"]}
            iconName="security"
            label={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.requiredClaims"
            )}
          />
          <RequestedCredentialsBlock credentials={credentials} />
        </View>
      ))}

      {optional.map(({ purpose, credentials }) => (
        <View key={`optional:${purpose}`}>
          <ListItemCheckbox
            description={
              purpose
                ? I18n.t("features.itWallet.presentation.remote.purpose", {
                    purpose
                  })
                : undefined
            }
            icon="security"
            onValueChange={() => sendCredentialsToMachine(credentials)}
            value={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.optionalClaims"
            )}
          />
          <RequestedCredentialsBlock credentials={credentials} />
          <VSpacer size={16} />
          <Alert
            content={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.optionalClaimsAlert"
            )}
            variant="info"
          />
        </View>
      ))}
    </VStack>
  );
};

const MemoizedItwRemotePresentationDetails = memo(ItwRemotePresentationDetails);

export { MemoizedItwRemotePresentationDetails as ItwRemotePresentationDetails };
