import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwCredentialsAllSelector } from "../../credentials/store/selectors";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { ItwCredentialStatus } from "../../common/utils/itwTypesUtils";
import {
  itwDebugClearCredentialStatusOverride,
  itwDebugClearGlobalStatusOverride,
  itwDebugSaveOriginalCredentials,
  itwDebugSetCredentialStatusOverride,
  itwDebugSetGlobalStatusOverride
} from "../store/actions";
import {
  itwDebugCredentialStatusOverridesSelector,
  itwDebugGlobalStatusOverrideSelector,
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
  const globalOverride = useIOSelector(itwDebugGlobalStatusOverrideSelector);
  const credentialOverrides = useIOSelector(
    itwDebugCredentialStatusOverridesSelector
  );
  const savedCredentials = useIOSelector(itwDebugSavedCredentialsSelector);
  const allCredentials = useIOSelector(itwCredentialsAllSelector);

  // Status overrides are only available in PRE environment
  if (env !== "pre") {
    return null;
  }

  const ensureOriginalsAreSaved = () => {
    if (savedCredentials === undefined) {
      dispatch(itwDebugSaveOriginalCredentials(Object.values(allCredentials)));
    }
  };

  const applyGlobalOverride = (status: ItwCredentialStatus) => {
    ensureOriginalsAreSaved();
    const modified = Object.values(allCredentials).map(c =>
      applyStatusToCredential(c, status)
    );
    dispatch(itwCredentialsStore(modified));
    dispatch(itwDebugSetGlobalStatusOverride(status));
  };

  const resetGlobalOverride = () => {
    if (savedCredentials !== undefined) {
      dispatch(itwCredentialsStore(Object.values(savedCredentials)));
    }
    dispatch(itwDebugClearGlobalStatusOverride());
  };

  const applyCredentialOverride = (
    credentialType: string,
    status: ItwCredentialStatus
  ) => {
    ensureOriginalsAreSaved();
    const credential = allCredentials[credentialType];
    if (credential === undefined) {
      return;
    }
    dispatch(
      itwCredentialsStore([applyStatusToCredential(credential, status)])
    );
    dispatch(itwDebugSetCredentialStatusOverride({ credentialType, status }));
  };

  const resetCredentialOverride = (credentialType: string) => {
    const originals = savedCredentials ?? {};
    // Find the original credential(s) matching the given type
    const original = Object.values(originals).find(
      c => c.credentialType === credentialType
    );
    if (original !== undefined) {
      dispatch(itwCredentialsStore([original]));
    }
    dispatch(itwDebugClearCredentialStatusOverride({ credentialType }));
  };

  const handleGlobalPress = () => {
    Alert.alert(
      "Simula stato globale credenziali",
      "Modifica tutti i dati nello store per simulare lo stato selezionato. Usa Reset per ripristinare i dati reali.",
      [
        ...ALL_STATUSES.map(status => ({
          text: status === globalOverride ? `✓ ${status}` : status,
          onPress: () => applyGlobalOverride(status)
        })),
        ...(globalOverride !== undefined
          ? [
              {
                text: "Reset",
                style: "destructive" as const,
                onPress: resetGlobalOverride
              }
            ]
          : []),
        { text: "Annulla", style: "cancel" as const }
      ]
    );
  };

  const handleCredentialPress = (credentialType: string) => {
    const currentOverride = credentialOverrides[credentialType];
    Alert.alert(
      `Simula stato: ${credentialType}`,
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

  const credentialTypes = Object.keys(allCredentials);

  return (
    <View style={{ paddingBottom: 24 }}>
      <ListItemHeader label="Status Override (PRE only)" />
      <ListItemNav
        value="Stato globale credenziali"
        description={
          globalOverride
            ? `Override attivo: ${globalOverride}`
            : "Nessun override"
        }
        onPress={handleGlobalPress}
      />
      {credentialTypes.map(credentialType => (
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
