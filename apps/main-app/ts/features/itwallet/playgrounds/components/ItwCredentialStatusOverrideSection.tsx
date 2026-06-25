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
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { ItwCredentialStatus } from "../../common/utils/itwTypesUtils";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { itwCredentialsAllSelector } from "../../credentials/store/selectors";
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

const NO_OVERRIDE = "no_override" as const;
type CredentialStatusPickerProps = {
  credentialType: string;
  currentOverride: ItwCredentialStatus | undefined;
  onReset: () => void;
  onSelect: (status: ItwCredentialStatus) => void;
};

type StatusOption = ItwCredentialStatus | typeof NO_OVERRIDE;

const CredentialStatusPicker = ({
  credentialType,
  currentOverride,
  onSelect,
  onReset
}: CredentialStatusPickerProps) => {
  const noOverrideItem: RadioItem<StatusOption> = {
    id: NO_OVERRIDE,
    value: "No override"
  };
  const statusItems: ReadonlyArray<RadioItem<StatusOption>> = [
    noOverrideItem,
    ...getAvailableStatusOverrides(credentialType).map(s => ({
      id: s,
      value: s
    }))
  ];

  return (
    <View>
      <RadioGroup<StatusOption>
        items={statusItems}
        onPress={status => {
          if (status === NO_OVERRIDE) {
            onReset();
          } else {
            onSelect(status);
          }
        }}
        selectedItem={currentOverride ?? NO_OVERRIDE}
        type="radioListItem"
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
        onReset={() => resetCredentialOverride(selectedCredentialType)}
        onSelect={status =>
          applyCredentialOverride(selectedCredentialType, status)
        }
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
            description={
              credentialOverrides[credentialType]
                ? `Active override: ${credentialOverrides[credentialType]}`
                : "No override"
            }
            key={credentialType}
            onPress={() => handlePress(credentialType)}
            value={credentialType}
          />
        ))}
      </View>
      {bottomSheet}
    </>
  );
};
