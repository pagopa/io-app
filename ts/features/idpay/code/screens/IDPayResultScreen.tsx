import { IOPictograms } from "@pagopa/io-app-design-system";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";

export const IDPayCodeResultsScreen = () => {
  const route = useRoute<any>(); // any is used to avoid introducing typing for mocks where they will be removed soon
  const isError = route.params.isError ?? false; // will be taken from state
  const navigation = useNavigation();
  const handler = navigation.goBack; // send some action to the store/ pop navigation
  const failureType = "GENERIC"; // will get from selector
  return isError ? (
    <OperationResultScreenContent
      title={I18n.t(
        `idpay.initiative.discountDetails.IDPayCode.failureScreen.header.${failureType}`
      )}
      pictogram={errorComponentMappings[failureType]}
      action={{
        label: I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.failureScreen.cta"
        ),
        accessibilityLabel: I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.failureScreen.cta"
        ),
        onPress: handler
      }}
    />
  ) : (
    <OperationResultScreenContent
      title={I18n.t(
        `idpay.initiative.discountDetails.IDPayCode.successScreen.header`
      )}
      pictogram="success"
      action={{
        label: I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.successScreen.cta"
        ),
        accessibilityLabel: I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.successScreen.cta"
        ),
        onPress: handler
      }}
      subtitle={I18n.t(
        "idpay.initiative.discountDetails.IDPayCode.successScreen.body"
      )}
    />
  );
};

const errorComponentMappings: { [key: string]: IOPictograms } = {
  // will be error type
  ["GENERIC"]: "umbrellaNew" // "GENERIC"=>errors.GENERIC
};
