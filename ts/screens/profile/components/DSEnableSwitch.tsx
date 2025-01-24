import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ListItemSwitch,
  useIOExperimentalDesign
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { useIOSelector, useIODispatch } from "../../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { preferencesDesignSystemSetEnabled } from "../../../store/actions/persistedPreferences";
import { DS_PERSISTENCE_KEY } from "../../../common/context/DSExperimentalContext";

const DSEnableSwitch = () => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  const dispatch = useIODispatch();
  const { isExperimental, setExperimental } = useIOExperimentalDesign();
  const onSwitchValueChange = (isDesignSystemEnabled: boolean) => {
    AsyncStorage.setItem(
      DS_PERSISTENCE_KEY,
      JSON.stringify(isDesignSystemEnabled)
    ).finally(() => {
      dispatch(preferencesDesignSystemSetEnabled({ isDesignSystemEnabled }));
      setExperimental(isDesignSystemEnabled);
    });
  };

  return (
    <ListItemSwitch
      label={I18n.t("profile.main.experimentalEnvironment")}
      value={isDesignSystemEnabled && isExperimental}
      onSwitchValueChange={onSwitchValueChange}
    />
  );
};

export default DSEnableSwitch;
