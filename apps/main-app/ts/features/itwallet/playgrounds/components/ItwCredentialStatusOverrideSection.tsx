import {
  ListItemHeader,
  ListItemNav,
  RadioGroup,
  RadioItem,
  VSpacer
} from "@io-app/design-system";
import { useState } from "react";
import { View } from "react-native";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { ItwCredentialStatus } from "../../common/utils/itwTypesUtils";
import { itwCredentialsStore } from "../../credentials/store/actions";
import {
  itwCredentialsAllSelector,
  itwCredentialsByTypeSelector
} from "../../credentials/store/selectors";
import {
  applyStatusToCredential,
  getAvailableStatusOverrides
} from "../utils/itwDebugCredentialUtils";

type CredentialStatusPickerProps = {
  credentialType: string;
  currentStatus: ItwCredentialStatus;
  onSelect: (status: ItwCredentialStatus) => void;
};

const CredentialStatusPicker = ({
  credentialType,
  currentStatus,
  onSelect
}: CredentialStatusPickerProps) => {
  const statusItems: ReadonlyArray<RadioItem<ItwCredentialStatus>> =
    getAvailableStatusOverrides(credentialType).map(status => ({
      id: status,
      value: status
    }));

  return (
    <View>
      <RadioGroup<ItwCredentialStatus>
        items={statusItems}
        onPress={onSelect}
        selectedItem={currentStatus}
        type="radioListItem"
      />
      <VSpacer size={16} />
    </View>
  );
};

export const ItwCredentialStatusOverrideSection = () => {
  const dispatch = useIODispatch();
  const env = useIOSelector(selectItwEnv);
  const allCredentials = useIOSelector(itwCredentialsAllSelector);
  const credentialsByType = useIOSelector(itwCredentialsByTypeSelector);
  const [selectedCredentialType, setSelectedCredentialType] = useState<
    string | undefined
  >(undefined);

  const applyCredentialOverride = (
    credentialType: string,
    status: ItwCredentialStatus
  ) => {
    const credentials = Object.values(credentialsByType[credentialType] ?? {});
    if (credentials.length === 0) {
      return;
    }

    dispatch(
      itwCredentialsStore(
        credentials.map(credential =>
          applyStatusToCredential(credential, status)
        )
      )
    );
  };

  const selectedCredential =
    selectedCredentialType === undefined
      ? undefined
      : allCredentials[selectedCredentialType];

  const { present, bottomSheet } = useIOBottomSheetModal({
    title: selectedCredentialType ?? "",
    component:
      selectedCredentialType !== undefined &&
      selectedCredential !== undefined ? (
        <CredentialStatusPicker
          credentialType={selectedCredentialType}
          currentStatus={getCredentialStatus(selectedCredential)}
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

  const handlePress = (credentialType: string) => {
    setSelectedCredentialType(credentialType);
    present();
  };

  return (
    <>
      <View>
        <ListItemHeader label="Status Override (PRE only)" />
        {Object.entries(allCredentials).map(([credentialType, credential]) => (
          <ListItemNav
            description={getCredentialStatus(credential)}
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
