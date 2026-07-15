import { ListItemSwitch, useIOExperimentalDesign } from "@io-app/design-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import I18n from "i18next";

import { DS_PERSISTENCE_KEY } from "../../../../common/context/DSExperimentalContext";
import { preferencesExperimentalDesignEnabled } from "../../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isExperimentalDesignEnabledSelector } from "../../../../store/reducers/persistedPreferences";

const ExperimentalDesignEnableSwitch = () => {
  const isExperimentalDesignEnabled = useIOSelector(
    isExperimentalDesignEnabledSelector
  );
  const dispatch = useIODispatch();
  const { isExperimental, setExperimental } = useIOExperimentalDesign();
  const onSwitchValueChange = (
    internalIsExperimentalDesignEnabled: boolean
  ) => {
    void AsyncStorage.setItem(
      DS_PERSISTENCE_KEY,
      JSON.stringify(internalIsExperimentalDesignEnabled)
    ).finally(() => {
      dispatch(
        preferencesExperimentalDesignEnabled({
          isExperimentalDesignEnabled: internalIsExperimentalDesignEnabled
        })
      );
      setExperimental(internalIsExperimentalDesignEnabled);
    });
  };

  return (
    <ListItemSwitch
      label={I18n.t("profile.main.experimentalEnvironment")}
      onSwitchValueChange={onSwitchValueChange}
      value={isExperimentalDesignEnabled && isExperimental}
    />
  );
};

export default ExperimentalDesignEnableSwitch;
