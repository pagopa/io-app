import React from "react";
import { IOIcons, ListItemSwitch } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../store/hooks";
import {
  isLoadingServicePreferenceSelector,
  servicePreferenceByChannelSelector
} from "../store/reducers/servicePreference";
import { EnabledChannels } from "../../../utils/profile";

export type ServicePreferenceListItemSwitchProps = {
  channel: keyof EnabledChannels;
  icon: IOIcons;
  label: string;
  onPreferenceValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export const ServicePreferenceListItemSwitch = ({
  channel,
  disabled = false,
  icon,
  label,
  onPreferenceValueChange
}: ServicePreferenceListItemSwitchProps) => {
  const servicePreferenceByChannel = useIOSelector(state =>
    servicePreferenceByChannelSelector(state, channel)
  );

  const isLoadingServicePreference = useIOSelector(
    isLoadingServicePreferenceSelector
  );

  return (
    <ListItemSwitch
      disabled={disabled}
      icon={icon}
      isLoading={isLoadingServicePreference}
      label={label}
      onSwitchValueChange={onPreferenceValueChange}
      value={servicePreferenceByChannel}
    />
  );
};
