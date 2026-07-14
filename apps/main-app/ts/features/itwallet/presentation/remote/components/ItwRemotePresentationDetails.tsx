import {
  Alert,
  ListItemCheckbox,
  ListItemHeader,
  VSpacer,
  VStack,
  useIOTheme
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
          key={id}
          credentialType={credentialType}
          items={claimsToDisplay}
          defaultExpanded
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
