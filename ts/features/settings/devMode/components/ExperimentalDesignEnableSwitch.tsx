import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ListItemSwitch,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector, useIODispatch } from "../../../../store/hooks";
import { isExperimentalDesignEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { preferencesExperimentalDesignEnabled } from "../../../../store/actions/persistedPreferences";
import { DS_PERSISTENCE_KEY } from "../../../../common/context/DSExperimentalContext";

const ExperimentalDesignEnableSwitch = () => {
  const isExperimentalDesignEnabled = useIOSelector(
    isExperimentalDesignEnabledSelector
  );
  const dispatch = useIODispatch();
  const { isExperimental, setExperimental } = useIOExperimentalDesign();
  const onSwitchValueChange = (
    internalIsExperimentalDesignEnabled: boolean
  ) => {
    AsyncStorage.setItem(
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
      value={isExperimentalDesignEnabled && isExperimental}
      onSwitchValueChange={onSwitchValueChange}
    />
  );
};

export default ExperimentalDesignEnableSwitch;
