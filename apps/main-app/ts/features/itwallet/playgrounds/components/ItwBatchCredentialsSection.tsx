import {
  Divider,
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  useIOToast,
  VSpacer,
  VStack
} from "@io-app/design-system";
import { useMemo } from "react";
import { View } from "react-native";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import {
  BATCH_ISSUANCE_CREDENTIALS,
  shouldRefillBatch
} from "../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialKeyTags } from "../../common/utils/itwCredentialUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import {
  itwCredentialsBatchRefillRequest,
  itwCredentialsConsumeInstance
} from "../../credentials/store/actions";
import {
  itwAllStoredCredentialsSelector,
  itwCredentialsToRefillSelector
} from "../../credentials/store/selectors";

const BATCH_CREDENTIAL_TYPES = Object.keys(BATCH_ISSUANCE_CREDENTIALS);

/**
 * Playground section for one-time-use credentials obtained in batch.
 *
 * It exposes the two triggers of the silent renewal so they can be exercised
 * without a real remote presentation: consuming a copy (as a successful
 * presentation would) and requesting the renewal directly. Both go through the
 * production sagas, so the threshold and lifecycle checks still apply: a pool
 * above its refill threshold is left untouched by the renewal request.
 */
export const ItwBatchCredentialsSection = () => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const storedCredentials = useIOSelector(itwAllStoredCredentialsSelector);
  const credentialTypesToRefill = useIOSelector(itwCredentialsToRefillSelector);

  const instancesByType = useMemo(
    () =>
      BATCH_CREDENTIAL_TYPES.map(credentialType => ({
        credentialType,
        instances: storedCredentials.filter(
          c => c.credentialType === credentialType
        )
      })),
    [storedCredentials]
  );

  const requestRefill = (
    credentialType: string,
    trigger: "app-start" | "presentation"
  ) => {
    dispatch(itwCredentialsBatchRefillRequest({ credentialType, trigger }));
    toast.info(`Refill requested for ${credentialType} (${trigger})`);
  };

  const runAppStartCheck = () => {
    if (credentialTypesToRefill.length === 0) {
      toast.warning("No credential is under its refill threshold");
      return;
    }
    credentialTypesToRefill.forEach(credentialType =>
      requestRefill(credentialType, "app-start")
    );
  };

  return (
    <View>
      <ListItemHeader label="Batch credentials" />
      <ListItemInfo
        label="Configured types"
        value={BATCH_CREDENTIAL_TYPES.join(", ")}
      />
      <Divider />
      <ListItemInfo
        label="Under refill threshold"
        value={
          credentialTypesToRefill.length > 0
            ? credentialTypesToRefill.join(", ")
            : "None"
        }
      />
      <VSpacer size={16} />
      <IOButton
        label="Run app start refill check"
        onPress={runAppStartCheck}
        variant="solid"
      />
      <VSpacer size={24} />
      <VStack space={24}>
        {instancesByType.map(({ credentialType, instances }) => (
          <BatchCredentialItem
            credentialType={credentialType}
            instances={instances}
            key={credentialType}
            onRefillRequest={() =>
              requestRefill(credentialType, "presentation")
            }
          />
        ))}
      </VStack>
    </View>
  );
};

type BatchCredentialItemProps = {
  credentialType: string;
  instances: ReadonlyArray<CredentialMetadata>;
  onRefillRequest: () => void;
};

const BatchCredentialItem = ({
  credentialType,
  instances,
  onRefillRequest
}: BatchCredentialItemProps) => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const { consumeOnPresentation, desiredCount, refillThreshold } =
    BATCH_ISSUANCE_CREDENTIALS[credentialType];

  const consumeInstance = (credential: CredentialMetadata) => {
    const [keyTag] = getCredentialKeyTags(credential);
    dispatch(
      itwCredentialsConsumeInstance([
        { credentialId: credential.credentialId, keyTag }
      ])
    );
    toast.info(`Consumed one ${credential.format} copy of ${credentialType}`);
  };

  return (
    <View>
      <ListItemHeader label={credentialType} />
      <ListItemInfo
        label="Batch config"
        value={`Desired ${desiredCount} · Threshold ${refillThreshold} · Consume on presentation ${
          consumeOnPresentation ? "yes" : "no"
        }`}
      />
      {instances.length === 0 ? (
        <>
          <Divider />
          <ListItemInfo
            label="Stored copies"
            value="Credential not in wallet"
          />
        </>
      ) : (
        instances.map(credential => {
          const keyTags = getCredentialKeyTags(credential);
          return (
            <View key={credential.credentialId}>
              <Divider />
              <ListItemInfo
                label={`Copies (${credential.format})`}
                value={`${keyTags.length}${
                  shouldRefillBatch(credential) ? " · under threshold" : ""
                }`}
              />
              <ListItemInfoCopy
                label={`Key tags (${credential.format})`}
                onPress={() =>
                  clipboardSetStringWithFeedback(keyTags.join("\n"))
                }
                value={keyTags.join(", ")}
              />
              <IOButton
                color="danger"
                label={`Consume one ${credential.format} copy`}
                onPress={() => consumeInstance(credential)}
                variant="link"
              />
            </View>
          );
        })
      )}
      <VSpacer size={8} />
      <IOButton
        disabled={instances.length === 0}
        label="Request silent refill"
        onPress={onRefillRequest}
        variant="outline"
      />
    </View>
  );
};
