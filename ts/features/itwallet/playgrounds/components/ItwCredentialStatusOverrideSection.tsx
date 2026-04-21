import {
  ListItemHeader,
  ListItemNav,
  RadioGroup,
  RadioItem,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useState } from "react";
import { View } from "react-native";
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
import {
  applyStatusToCredential,
  getAvailableStatusOverrides
} from "../utils/itwDebugCredentialUtils";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

type CredentialStatusPickerProps = {
  credentialType: string;
  currentOverride: ItwCredentialStatus | undefined;
  onSelect: (status: ItwCredentialStatus) => void;
  onReset: () => void;
};

const CredentialStatusPicker = ({
  credentialType,
  currentOverride,
  onSelect,
  onReset
}: CredentialStatusPickerProps) => {
  const statusItems: ReadonlyArray<RadioItem<ItwCredentialStatus>> =
    getAvailableStatusOverrides(credentialType).map(s => ({ id: s, value: s }));

  return (
    <View>
      <RadioGroup<ItwCredentialStatus>
        type="radioListItem"
        items={statusItems}
        selectedItem={currentOverride}
        onPress={status => {
          if (status === currentOverride) {
            onReset();
          } else {
            onSelect(status);
          }
        }}
      />
      <VSpacer size={16} />
    </View>
  );
};

export const ItwCredentialStatusOverrideSection = () => {
  const dispatch = useIODispatch();
  const env = useIOSelector(selectItwEnv);
  const credentialOverrides = useIOSelector(
    itwDebugCredentialStatusOverridesSelector
  );
  const savedCredentials = useIOSelector(itwDebugSavedCredentialsSelector);
  const allCredentials = useIOSelector(itwCredentialsAllSelector);
  const [selectedCredentialType, setSelectedCredentialType] = useState<
    string | undefined
  >(undefined);

  const { present, bottomSheet } = useIOBottomSheetModal({
    title: selectedCredentialType ?? "",
    component: selectedCredentialType ? (
      <CredentialStatusPicker
        credentialType={selectedCredentialType}
        currentOverride={credentialOverrides[selectedCredentialType]}
        onSelect={status =>
          applyCredentialOverride(selectedCredentialType, status)
        }
        onReset={() => resetCredentialOverride(selectedCredentialType)}
      />
    ) : (
      <View />
    )
  });

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

  const handlePress = (credentialType: string) => {
    setSelectedCredentialType(credentialType);
    present();
  };

  return (
    <>
      <View>
        <ListItemHeader label="Status Override (PRE only)" />
        {Object.keys(allCredentials).map(credentialType => (
          <ListItemNav
            key={credentialType}
            value={credentialType}
            description={
              credentialOverrides[credentialType]
                ? `Active override: ${credentialOverrides[credentialType]}`
                : "No override"
            }
            onPress={() => handlePress(credentialType)}
          />
        ))}
      </View>
      {bottomSheet}
    </>
  );
};
