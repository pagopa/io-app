import { memo, useMemo } from "react";
import { View } from "react-native";
import {
  Alert,
  BodySmall,
  ClaimsSelector,
  ListItemCheckbox,
  ListItemHeader,
  VSpacer,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import {
  ClaimDisplayFormat,
  getClaimDisplayValue
} from "../../../common/utils/itwClaimsUtils";
import { selectPresentationDetails } from "../machine/selectors";
import { ItwRemoteMachineContext } from "../machine/provider";
import { EnrichedPresentationDetails } from "../utils/itwRemoteTypeUtils";
import { groupCredentialsByPurpose } from "../utils/itwRemotePresentationUtils";

const mapClaims = (claims: Array<ClaimDisplayFormat>) =>
  claims.map(c => {
    const displayValue = getClaimDisplayValue(c);
    return {
      id: c.id,
      title: Array.isArray(displayValue)
        ? displayValue.join(", ")
        : displayValue,
      description: c.label
    };
  });

const ItwRemotePresentationDetails = () => {
  const theme = useIOTheme();

  const machineRef = ItwRemoteMachineContext.useActorRef();
  const presentationDetails = ItwRemoteMachineContext.useSelector(
    selectPresentationDetails
  );

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

  const renderCredentialsBlock = (credentials: EnrichedPresentationDetails) => (
    <VStack space={24}>
      {credentials.map(c => (
        <ClaimsSelector
          key={c.id}
          title={getCredentialNameFromType(c.vct)}
          items={mapClaims(c.claimsToDisplay)}
          defaultExpanded
          selectionEnabled={false}
        />
      ))}
    </VStack>
  );

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
          />

          {purpose && (
            <BodySmall>
              {I18n.t("features.itWallet.presentation.remote.purpose", {
                purpose
              })}
            </BodySmall>
          )}
          {renderCredentialsBlock(credentials)}
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
          {renderCredentialsBlock(credentials)}
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
