import { VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { SafeAreaView, Text, View } from "react-native";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsHistoryGet } from "../store/actions";
import { fimsHistoryPotSelector } from "../store/selectors";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();
  const historyPot = useIOSelector(fimsHistoryPotSelector);

  React.useEffect(() => {
    dispatch(fimsHistoryGet.request({}));
  }, [dispatch]);

  useHeaderSecondLevel({
    title: "History"
  });
  if (pot.isLoading(historyPot)) {
    return <LoadingScreenContent contentTitle="" />;
  }
  const history = pot.toUndefined(historyPot)?.items ?? [];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {history.map((item, index) => (
        <View key={index}>
          <Text>{item.timestamp.toDateString()}</Text>
          <VSpacer size={8} />
        </View>
      ))}
    </SafeAreaView>
  );
};
