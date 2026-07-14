import { ListItemHeader, RadioGroup, RadioItem } from "@io-app/design-system";
import I18n from "i18next";
import { Alert, View } from "react-native";

import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { itwSetEnv } from "../../common/store/actions/environment";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { EnvType, getEnv } from "../../common/utils/environment";

export const ItwEnvironmentSection = () => {
  const dispatch = useIODispatch();
  const selectedEnv = useIOSelector(selectItwEnv);
  const envObject = getEnv(selectedEnv);

  useDebugInfo({
    env: envObject
  });

  const toggleEnvironment = (selected: EnvType) => {
    Alert.alert(
      I18n.t("features.itWallet.playgrounds.environment.alert.title", {
        environment: selected.toUpperCase()
      }),
      I18n.t("features.itWallet.playgrounds.environment.alert.content"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("global.buttons.confirm"),
          style: "destructive",
          onPress: () => {
            dispatch(itwSetEnv(selected));
          }
        }
      ],
      { cancelable: true }
    );
  };
  const envRadioItems = (): ReadonlyArray<RadioItem<EnvType>> => [
    {
      value: I18n.t(
        "features.itWallet.playgrounds.environment.toggle.pre.value"
      ),
      description: I18n.t(
        "features.itWallet.playgrounds.environment.toggle.pre.description"
      ),
      id: "pre"
    },
    {
      value: I18n.t(
        "features.itWallet.playgrounds.environment.toggle.prod.value"
      ),
      description: I18n.t(
        "features.itWallet.playgrounds.environment.toggle.prod.description"
      ),
      id: "prod"
    }
  ];

  return (
    <View>
      <ListItemHeader label="Environment" />
      <RadioGroup
        items={envRadioItems()}
        key="itw_environment"
        onPress={toggleEnvironment}
        selectedItem={selectedEnv}
        type="radioListItem"
      />
    </View>
  );
};
