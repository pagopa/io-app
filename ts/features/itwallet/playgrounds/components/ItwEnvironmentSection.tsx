import {
  ListItemHeader,
  RadioGroup,
  RadioItem
} from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { EnvType } from "../../common/utils/environment";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { itwSetEnv } from "../../common/store/actions/environment";
import { itwLifecycleStoresReset } from "../../lifecycle/store/actions";

export const ItwEnvironmentSection = () => {
  const dispatch = useIODispatch();
  const selectedEnv = useIOSelector(selectItwEnv);

  const toggleEnvionment = (selected: EnvType) => {
    Alert.alert(
      `Set environment to [${selected.toUpperCase()}]`,
      `This action will reset the IT Wallet state, which means you will lose all your credentials.\nThe action is not reversible.`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => {
            dispatch(itwLifecycleStoresReset());
            dispatch(itwSetEnv(selected));
          }
        }
      ],
      { cancelable: true }
    );
  };

  const envRadioItems = (): ReadonlyArray<RadioItem<EnvType>> => [
    {
      value: "Set PRE environment",
      description:
        "Use the PRE environment. A Proxy might be needed to access the services. This action will reset the IT Wallet state.",
      id: "pre"
    },
    {
      value: "Set PROD environment",
      description:
        "Use the PROD environment. This action will reset the IT Wallet state.",
      id: "prod"
    }
  ];

  return (
    <View>
      <ListItemHeader label="Environment" />
      <RadioGroup
        type="radioListItem"
        key="check_income"
        items={envRadioItems()}
        selectedItem={selectedEnv}
        onPress={toggleEnvionment}
      />
    </View>
  );
};
