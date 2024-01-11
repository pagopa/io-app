import React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOStyles } from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import ItwContinueView from "../../../components/ItwContinueView";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";

/**
 * Renders an activation screen which displays a loading screen while the PID is being added and a success screen when the PID is added.
 */
const ItwIssuancePidStoreScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  return (
    <SafeAreaView style={IOStyles.flex}>
      <ItwContinueView
        title={I18n.t(
          "features.itWallet.issuing.pidActivationScreen.typ.title"
        )}
        subtitle={I18n.t(
          "features.itWallet.issuing.pidActivationScreen.typ.content"
        )}
        pictogram="success"
        action={{
          label: I18n.t(
            "features.itWallet.issuing.pidActivationScreen.typ.button"
          ),
          accessibilityLabel: I18n.t(
            "features.itWallet.issuing.pidActivationScreen.typ.button"
          ),
          onPress: () =>
            navigation.navigate(ROUTES.MAIN, {
              screen: ROUTES.ITWALLET_HOME
            })
        }}
      />
    </SafeAreaView>
  );
};

export default ItwIssuancePidStoreScreen;
