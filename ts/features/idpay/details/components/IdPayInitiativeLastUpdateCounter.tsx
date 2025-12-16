import { BodySmall, IOSkeleton } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { format } from "../../../../utils/dates";

type Props = { isLoading: true } | { isLoading?: false; lastUpdateDate?: Date };

const IdPayInitiativeLastUpdateCounter = (props: Props) => {
  if (props.isLoading) {
    return (
      <View style={styles.lastUpdate}>
        <IOSkeleton shape="rectangle" height={16} width={180} radius={4} />
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
      weight="Regular"
      testID={"IDPayDetailsLastUpdatedTestID"}
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
