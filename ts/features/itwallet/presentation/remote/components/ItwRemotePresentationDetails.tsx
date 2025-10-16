import { ComponentProps, memo, useMemo } from "react";
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
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import {
  ClaimDisplayFormat,
  ImageClaim,
  getClaimDisplayValue,
  getSafeText
} from "../../../common/utils/itwClaimsUtils";
import { selectPresentationDetails } from "../machine/selectors";
import { ItwRemoteMachineContext } from "../machine/provider";
import { EnrichedPresentationDetails } from "../utils/itwRemoteTypeUtils";
import {
  getCredentialTypeByVct,
  groupCredentialsByPurpose
} from "../utils/itwRemotePresentationUtils";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";

const mapClaims = (
  claims: Array<ClaimDisplayFormat>
): ComponentProps<typeof ClaimsSelector>["items"] =>
  claims.map(c => {
    const displayValue = getClaimDisplayValue(c);
    if (ImageClaim.is(displayValue)) {
      return {
        id: c.id,
        value: displayValue,
        description: c.label,
        type: "image"
      };
    }
    return {
      id: c.id,
      value: Array.isArray(displayValue)
        ? displayValue.map(getSafeText).join(", ")
        : getSafeText(displayValue),
      description: c.label
    };
  });

const RequestedCredentialsBlock = ({
  credentials
}: {
  credentials: EnrichedPresentationDetails;
}) => (
  <VStack space={24}>
    {credentials
      .filter(c => c.claimsToDisplay.length > 0)
      .map(c => (
        <ClaimsSelector
          key={c.id}
          title={pipe(c.vct, getCredentialTypeByVct, credentialType =>
            getCredentialNameFromType(credentialType, "", true)
          )}
          items={mapClaims(c.claimsToDisplay)}
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
