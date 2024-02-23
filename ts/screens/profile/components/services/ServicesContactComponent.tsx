import React, { ReactElement, useEffect, useState } from "react";
import { RadioGroup, RadioItem } from "@pagopa/io-app-design-system";
import { ServicesPreferencesModeEnum } from "../../../../../definitions/backend/ServicesPreferencesMode";
import I18n from "../../../../i18n";
import { usePrevious } from "../../../../utils/hooks/usePrevious";

type Props = {
  onSelectMode: (mode: ServicesPreferencesModeEnum) => void;
  mode?: ServicesPreferencesModeEnum;
  showBadge?: boolean;
};

const options = (): ReadonlyArray<RadioItem<string>> => [
  {
    value: I18n.t("services.optIn.preferences.quickConfig.title"),
    id: ServicesPreferencesModeEnum.AUTO,
    description: I18n.t("services.optIn.preferences.quickConfig.body.text1")
  },
  {
    value: I18n.t("services.optIn.preferences.manualConfig.title"),
    id: ServicesPreferencesModeEnum.MANUAL,
    description: I18n.t("services.optIn.preferences.manualConfig.body.text1")
  }
];

const ServicesContactComponent = (props: Props): ReactElement => {
  const { mode, onSelectMode } = props;
  const [selectedItem, setSelectedItem] = useState(mode);
  const prevMode = usePrevious(mode);

  const handlePress = (value: any) => {
    onSelectMode(value);
  };

  useEffect(() => {
    if (mode !== prevMode) {
      // in case "MANUAL" if the user confirms that he
      // wants to use the MANUAL MODE after being
      // shown the bottomsheet then the data is selected
      // else the other option remains selected
      setSelectedItem(mode);
    }
  }, [mode, prevMode]);

  return (
    <RadioGroup<string>
      type="radioListItem"
      items={options()}
      selectedItem={selectedItem}
      onPress={handlePress}
    />
  );
};

export default ServicesContactComponent;
