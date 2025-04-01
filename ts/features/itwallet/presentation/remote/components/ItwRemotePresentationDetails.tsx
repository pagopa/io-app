import { memo } from "react";
import { View } from "react-native";
import {
  Body,
  ClaimsSelector,
  ListItemHeader,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";
import {
  selectPresentationDetails,
  selectUserSelectedOptionalCredentials
} from "../machine/selectors";
import { ItwRemoteMachineContext } from "../machine/provider";
import { EnrichedPresentationDetails } from "../utils/itwRemoteTypeUtils";
import { groupCredentialsByPurpose } from "../utils/itwRemotePresentationUtils";

const mapClaims = (claims: Array<ClaimDisplayFormat>) =>
  claims.map(c => ({
    id: c.id,
    title: c.value as string,
    description: c.label
  }));

const ItwRemotePresentationDetails = () => {
  const theme = useIOTheme();

  const machineRef = ItwRemoteMachineContext.useActorRef();
  const presentationDetails = ItwRemoteMachineContext.useSelector(
    selectPresentationDetails
  );
  const selectedOptionalCredentials = ItwRemoteMachineContext.useSelector(
    selectUserSelectedOptionalCredentials
  );

  if (!presentationDetails) {
    return null;
  }

  const { required, optional } = groupCredentialsByPurpose(presentationDetails);

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
          {purpose && <Body>{purpose}</Body>}
          {renderCredentialsBlock(credentials)}
        </View>
      ))}

      {optional.map(({ purpose, credentials }) => (
        <View key={`optional:${purpose}`}>
          <ListItemHeader
            label={I18n.t(
              "features.itWallet.presentation.selectiveDisclosure.optionalClaims"
            )}
            iconName="security"
            iconColor={theme["icon-decorative"]}
          />
          {purpose && <Body>{purpose}</Body>}
          {renderCredentialsBlock(credentials)}
        </View>
      ))}
    </VStack>
  );
};

const MemoizedItwRemotePresentationDetails = memo(ItwRemotePresentationDetails);

export { MemoizedItwRemotePresentationDetails as ItwRemotePresentationDetails };
