import {
  ListItemHeader,
  RadioGroup,
  RadioItem
} from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { EnvType, getEnv } from "../../common/utils/environment";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { itwSetEnv } from "../../common/store/actions/environment";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";

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
        type="radioListItem"
        key="itw_environment"
        items={envRadioItems()}
        selectedItem={selectedEnv}
        onPress={toggleEnvironment}
      />
    </View>
  );
};
