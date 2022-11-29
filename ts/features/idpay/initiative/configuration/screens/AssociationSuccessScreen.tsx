import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { useActor } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import CompletedIcon from "../../../../../../img/pictograms/payment-completed.svg";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import themeVariables from "../../../../../theme/variables";
import { useConfigurationMachineService } from "../xstate/provider";

const AssociationSuccessScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const configurationMachine = useConfigurationMachineService();
  const [state] = useActor(configurationMachine);

  const initiativeDetails = pipe(
    state.context.initiative,
    pot.toOption,
    O.toUndefined
  );

  if (initiativeDetails === undefined) {
    return null;
  }

  const handleNavigateToInitiativePress = () => {
    navigation.navigate(ROUTES.IDPAY_INITIATIVE_DETAILS, {
      initiativeId: initiativeDetails.initiativeId
    });
  };

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={[IOStyles.horizontalContentPadding, styles.container]}>
        <View style={styles.content}>
          <CompletedIcon width={80} height={80} />
          <View spacer={true} />
          <H3>{I18n.t("idpay.configuration.associationSuccess.title")}</H3>
          <View spacer={true} />
          <Text style={styles.body}>
            {I18n.t("idpay.configuration.associationSuccess.body", {
              initiativeName: initiativeDetails.initiativeName
            })}
          </Text>
        </View>
        <ButtonDefaultOpacity
          block={true}
          onPress={handleNavigateToInitiativePress}
        >
          <Text white={true}>
            {I18n.t("idpay.configuration.associationSuccess.button")}
          </Text>
        </ButtonDefaultOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: themeVariables.contentPadding
  },
  body: {
    textAlign: "center"
  },
  content: {
    flex: 1,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default AssociationSuccessScreen;
