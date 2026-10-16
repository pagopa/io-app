import {
  Alert,
  ListItemCheckbox,
  ListItemHeader,
  useIOTheme,
  VSpacer,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { memo, useMemo } from "react";
import { View } from "react-native";

import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import { ItwClaimsSelector } from "../../common/components/ItwClaimsSelector";
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
}) => (
  <VStack space={24}>
    {credentials
      .filter(c => c.format === "dc+sd-jwt") // TODO: [SIW-3998] Support MDOC remote presentation
      .filter(c => c.claimsToDisplay.length > 0)
      // Credentials with an unrecognized type should never happen; flatMap
      // drops them, which also narrows `credentialType` to a defined value.
      .flatMap(c => {
        const credentialType = getCredentialTypeByVct(c.vct);
        return credentialType === undefined
          ? []
          : [{ id: c.id, credentialType, claimsToDisplay: c.claimsToDisplay }];
      })
      .map(({ id, credentialType, claimsToDisplay }) => (
        <ItwClaimsSelector
          credentialType={credentialType}
          defaultExpanded
          items={claimsToDisplay}
          key={id}
          selectionEnabled={false}
        />
      ))}
  </VStack>
);

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
