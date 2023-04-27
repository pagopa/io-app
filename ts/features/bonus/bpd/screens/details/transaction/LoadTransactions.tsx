import * as React from "react";
import { View, ActivityIndicator } from "react-native";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../../../i18n";

/**
 * This screen is displayed when loading the list of transactions
 * @constructor
 */
const LoadTransactions: React.FunctionComponent = () => (
  <View accessible={true} style={IOStyles.flex} testID={"LoadTransactions"}>
    <InfoScreenComponent
      image={
        <ActivityIndicator
          color={"black"}
          accessible={false}
          importantForAccessibility={"no-hide-descendants"}
          accessibilityElementsHidden={true}
          testID={"activityIndicator"}
        />
      }
      title={I18n.t("bonus.bpd.details.transaction.loading")}
    />
  </View>
);

export default LoadTransactions;
