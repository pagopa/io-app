import * as React from "react";
import { useIOExperimentalDesign } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { SwitchListItem } from "../../../components/ui/SwitchListItem";
import { useIOSelector, useIODispatch } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { preferencesDesignSystemSetEnabled } from "../../../store/actions/persistedPreferences";

const DSEnableSwitch = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const dispatch = useIODispatch();
  const { isExperimental, setExperimental } = useIOExperimentalDesign();
  const onSwitchValueChange = (isDesignSystemEnabled: boolean) => {
    dispatch(preferencesDesignSystemSetEnabled({ isDesignSystemEnabled }));
    setExperimental(isDesignSystemEnabled);
  };

  return (
    <SwitchListItem
      label={I18n.t("profile.main.designSystemEnvironment")}
      value={isDesignSystemEnabled && isExperimental}
      onSwitchValueChange={onSwitchValueChange}
    />
  );
};

export default DSEnableSwitch;
