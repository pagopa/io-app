import {
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  TextInput,
  VSpacer
} from "@io-app/design-system";
import { useState } from "react";

import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { getDeviceId } from "../../../../../utils/device";
import {
  computeDeviceRolloutRatio,
  isFeatureEnabled
} from "../../../../../utils/featureRollout";
import { DEFAULT_ROLLOUT_PERCENTAGE, parseRolloutPercentage } from "./utils";

/**
 * Shows the real device ID and lets the user check, at any rollout
 * percentage, whether this specific device would be enabled, along with its
 * intrinsic activation threshold.
 */
export const OwnDeviceSection = () => {
  const [rolloutPercentageInput, setRolloutPercentageInput] = useState(
    DEFAULT_ROLLOUT_PERCENTAGE
  );

  const rolloutPercentage = parseRolloutPercentage(rolloutPercentageInput);
  const ownDeviceId = getDeviceId();
  const isOwnDeviceEnabled = isFeatureEnabled(ownDeviceId, rolloutPercentage);
  const ownDeviceRolloutRatio = computeDeviceRolloutRatio(ownDeviceId);

  return (
    <>
      <ListItemHeader label="Device" />
      <TextInput
        accessibilityHint="Percentuale di rollout da 0 a 100"
        accessibilityLabel="Percentuale di rollout"
        onChangeText={setRolloutPercentageInput}
        placeholder="Rollout %"
        value={rolloutPercentageInput}
      />
      <VSpacer size={16} />
      <ListItemInfo
        endElement={{
          type: "badge",
          componentProps: {
            text: isOwnDeviceEnabled ? "\u{1F7E2} YES" : "\u{1F534} NO",
            variant: isOwnDeviceEnabled ? "success" : "error"
          }
        }}
        label={`Rollout al ${rolloutPercentage}%`}
        value="Feature abilitata"
      />
      <Divider />
      <ListItemInfo
        endElement={{
          type: "badge",
          componentProps: {
            text: `${(ownDeviceRolloutRatio * 100).toFixed(2)}%`,
            variant: "default"
          }
        }}
        label="Si abilita quando il rollout supera questa soglia"
        value="Soglia intrinseca del device"
      />
      <Divider />
      <ListItemInfoCopy
        label="Device ID"
        onPress={() => clipboardSetStringWithFeedback(ownDeviceId)}
        value={ownDeviceId}
      />
    </>
  );
};
