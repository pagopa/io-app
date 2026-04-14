import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwCredentialsAllSelector } from "../../credentials/store/selectors";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { ItwCredentialStatus } from "../../common/utils/itwTypesUtils";
import {
  itwDebugClearCredentialStatusOverride,
  itwDebugSaveOriginalCredentials,
  itwDebugSetCredentialStatusOverride
} from "../store/actions";
import {
  itwDebugCredentialStatusOverridesSelector,
  itwDebugSavedCredentialsSelector
} from "../store/selectors";
import { applyStatusToCredential } from "../utils/itwDebugCredentialUtils";
import { selectItwEnv } from "../../common/store/selectors/environment";

const ALL_STATUSES: ReadonlyArray<ItwCredentialStatus> = [
  "valid",
  "invalid",
  "expiring",
  "expired",
  "jwtExpiring",
  "jwtExpired",
  "unknown"
];

export const ItwCredentialStatusOverrideSection = () => {
  const dispatch = useIODispatch();
  const env = useIOSelector(selectItwEnv);
  const credentialOverrides = useIOSelector(
    itwDebugCredentialStatusOverridesSelector
  );
  const savedCredentials = useIOSelector(itwDebugSavedCredentialsSelector);
  const allCredentials = useIOSelector(itwCredentialsAllSelector);

  if (env !== "pre" || Object.keys(allCredentials).length === 0) {
    return null;
  }

  const ensureOriginalsAreSaved = () => {
    if (savedCredentials === undefined) {
      dispatch(itwDebugSaveOriginalCredentials(Object.values(allCredentials)));
    }
  };

  const applyCredentialOverride = (
    credentialType: string,
    status: ItwCredentialStatus
  ) => {
    const credential = allCredentials[credentialType];
    if (credential === undefined) {
      return;
    }
    ensureOriginalsAreSaved();
    dispatch(
      itwCredentialsStore([applyStatusToCredential(credential, status)])
    );
    dispatch(itwDebugSetCredentialStatusOverride({ credentialType, status }));
  };

  const resetCredentialOverride = (credentialType: string) => {
    const originals = savedCredentials ?? {};
    const original = Object.values(originals).find(
      c => c.credentialType === credentialType
    );
    if (original !== undefined) {
      dispatch(itwCredentialsStore([original]));
    }
    dispatch(itwDebugClearCredentialStatusOverride({ credentialType }));
  };

  const handleCredentialPress = (credentialType: string) => {
    const currentOverride = credentialOverrides[credentialType];
    Alert.alert(
      `Simula stato credenziale: ${credentialType}`,
      "Modifica i dati di questa credenziale per simulare lo stato selezionato.",
      [
        ...ALL_STATUSES.map(status => ({
          text: status === currentOverride ? `✓ ${status}` : status,
          onPress: () => applyCredentialOverride(credentialType, status)
        })),
        ...(currentOverride !== undefined
          ? [
              {
                text: "Reset",
                style: "destructive" as const,
                onPress: () => resetCredentialOverride(credentialType)
              }
            ]
          : []),
        { text: "Annulla", style: "cancel" as const }
      ]
    );
  };

  return (
    <View style={{ paddingBottom: 24 }}>
      <ListItemHeader label="Status Override (PRE only)" />
      {Object.keys(allCredentials).map(credentialType => (
        <ListItemNav
          key={credentialType}
          value={credentialType}
          description={
            credentialOverrides[credentialType]
              ? `Override attivo: ${credentialOverrides[credentialType]}`
              : "Nessun override"
          }
          onPress={() => handleCredentialPress(credentialType)}
        />
      ))}
    </View>
  );
};
