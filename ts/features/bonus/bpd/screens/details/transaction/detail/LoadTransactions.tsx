import { View } from "native-base";
import * as React from "react";
import { ActivityIndicator } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { useHardwareBackButton } from "../../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { LoadingErrorComponent } from "../../../../../../bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

/**
 * This screen is displayed when searching for Bancomat
 * @constructor
 */
const LoadTransactions: React.FunctionComponent = () => {
  return (
    <View accessible={true} style={{ flex: 1 }}>
      <InfoScreenComponent
        image={
          <ActivityIndicator
            color={"black"}
            accessible={false}
            importantForAccessibility={"no-hide-descendants"}
            accessibilityElementsHidden={true}
          />
        }
        title={"pippo"}
      />
    </View>
  );
};

export default LoadTransactions;
