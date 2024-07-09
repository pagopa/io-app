import { Divider, IOStyles, ListItemNav } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { Consent } from "../../../../../definitions/fims/Consent";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { fimsHistoryGet } from "../store/actions";
import { fimsHistoryPotSelector } from "../store/selectors";

export const FimsHistoryScreen = () => {
  const dispatch = useIODispatch();
  const historyPot = useIOSelector(fimsHistoryPotSelector);

  React.useEffect(() => {
    dispatch(fimsHistoryGet.request({ isFirstRequest: true }));
  }, [dispatch]);

  useHeaderSecondLevel({
    title: "History"
  });
  if (pot.isLoading(historyPot)) {
    return <LoadingScreenContent contentTitle="" />;
  }

  const generateHistoryList = (history: ReadonlyArray<Consent>) => (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={history}
        contentContainerStyle={IOStyles.horizontalContentPadding}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => (
          <ListItemNav
            key={item.id}
            onPress={() => null}
            value={item.service_id}
            topElement={{
              dateValue: item.timestamp.toDateString()
            }}
            description={"description"}
            hideChevron
          />
        )}
      />
    </SafeAreaView>
  );
  return pipe(
    historyPot,
    pot.toOption,
    O.map(history => history.items),
    O.fold(() => null, generateHistoryList)
  );
};
