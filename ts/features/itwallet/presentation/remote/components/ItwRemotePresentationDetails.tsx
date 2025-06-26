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
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import I18n from "../../../../../i18n";
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
import { groupCredentialsByPurpose } from "../utils/itwRemotePresentationUtils";
import { trackItwRemoteDataShare } from "../analytics";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";

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

  useOnFirstRender(() => {
    const requestedCredentials = [...required, ...optional];

    const data_type = optional.length > 0 ? "optional" : "required";

    /**
     * Returns the request type based on the "purpose" fields in the credentials:
     * - "no_purpose" if none are defined
     * - "unique_purpose" if there's only one purpose, or all share the same purpose
     * - "multiple_purpose" if there are multiple distinct valid purposes
     * A purpose is considered valid only if it's a non-empty, non-whitespace string.
     */
    const request_type = pipe(
      requestedCredentials,
      A.map(item => item.purpose),
      A.filterMap(O.fromPredicate(p => !!p?.trim())),
      A.uniq(S.Eq),
      purposes =>
        purposes.length === 0
          ? "no_purpose"
          : purposes.length === 1
          ? "unique_purpose"
          : "multiple_purpose"
    );

    trackItwRemoteDataShare({
      data_type,
      request_type
    });
  });

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
            description={
              purpose
                ? I18n.t("features.itWallet.presentation.remote.purpose", {
                    purpose
                  })
                : undefined
            }
          />
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
