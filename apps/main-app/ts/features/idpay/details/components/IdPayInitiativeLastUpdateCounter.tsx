import { BodySmall, IOSkeleton } from "@io-app/design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { format } from "../../../../utils/dates";

type Props = { isLoading: true } | { isLoading?: false; lastUpdateDate?: Date };

const IdPayInitiativeLastUpdateCounter = (props: Props) => {
  if (props.isLoading) {
    return (
      <View style={styles.lastUpdate}>
        <IOSkeleton height={16} radius={4} shape="rectangle" width={180} />
      </View>
    );
  }

  const lastUpdateString = pipe(
    props.lastUpdateDate,
    O.fromNullable,
    O.map(date => format(date, "DD MMMM YYYY, HH:mm")),
    O.toUndefined
  );

  if (!lastUpdateString) {
    return null;
  }

  return (
    <BodySmall
      style={styles.lastUpdate}
      testID={"IDPayDetailsLastUpdatedTestID"}
      weight="Regular"
    >
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.lastUpdated"
      )}
      {lastUpdateString}
    </BodySmall>
  );
};

const styles = StyleSheet.create({
  lastUpdate: {
    alignSelf: "center",
    alignItems: "center",
    padding: 16
  }
});

export { IdPayInitiativeLastUpdateCounter };
