import { ListItemAction } from "@io-app/design-system";
import { useCallback } from "react";

import {
  ServiceContactField,
  serviceContactMap
} from "../utils/serviceContactMap";

export type ServiceContactListItemProps = {
  onPress?: (value: string) => void;
  testID?: string;
  value?: string;
  variant: ServiceContactField;
};

export const ServiceContactListItem = ({
  onPress,
  testID,
  value,
  variant
}: ServiceContactListItemProps) => {
  const { openContact, accessibilityLabel, icon, label } =
    serviceContactMap[variant];

  const handlePress = useCallback(() => {
    if (!value) {return;}
    return onPress ? onPress(value) : openContact(value);
  }, [onPress, openContact, value]);
  if (!value) {
    return null;
  }

  return (
    <ListItemAction
      accessibilityLabel={accessibilityLabel()}
      icon={icon}
      label={label()}
      onPress={handlePress}
      testID={testID}
      variant="primary"
    />
  );
};
