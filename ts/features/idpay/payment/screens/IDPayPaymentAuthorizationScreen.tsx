import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IDPayPaymentParamsList } from "../navigation/navigator";
import { usePaymentMachineService } from "../xstate/provider";
import {
  selectIsAuthorizing,
  selectIsPreAuthorizing,
  selectTransactionData
} from "../xstate/selectors";

type IDPayPaymentAuthorizationScreenRouteParams = {
  trxCode?: string;
};

type IDPayPaymentAuthorizationRouteProps = RouteProp<
  IDPayPaymentParamsList,
  "IDPAY_PAYMENT_AUTHORIZATION"
>;

const IDPayPaymentAuthorizationScreen = () => {
  const route = useRoute<IDPayPaymentAuthorizationRouteProps>();

  const machine = usePaymentMachineService();
  const transactionData = useSelector(machine, selectTransactionData);

  const { trxCode } = route.params;

  React.useEffect(() => {
    pipe(
      trxCode,
      O.fromNullable,
      O.map(code =>
        machine.send({ type: "START_AUTHORIZATION", trxCode: code })
      )
    );
  }, [trxCode, machine]);

  // Loading state for screen content
  const isLoading = useSelector(machine, selectIsPreAuthorizing);
  // Loading state for "Confirm" button
  const isUpserting = useSelector(machine, selectIsAuthorizing);

  const handleCancel = () => {
    machine.send("CANCEL_AUTHORIZATION");
  };

  const handleConfirm = () => {
    machine.send("CONFIRM_AUTHORIZATION");
  };

  // TODO Debug. Screen content will be added in another PR
  const content = <Body>{JSON.stringify(transactionData, null, 4)}</Body>;

  return (
    <BaseScreenComponent
      headerTitle="Autorizza operazione"
      contextualHelp={emptyContextualHelp}
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
        <SafeAreaView style={IOStyles.flex}>
          <View style={IOStyles.flex}>
            <ContentWrapper>{content}</ContentWrapper>
          </View>
          <FooterWithButtons
            type="TwoButtonsInlineHalf"
            leftButton={{
              title: "Annulla",
              bordered: true,
              onPress: handleCancel,
              disabled: isUpserting
            }}
            rightButton={{
              title: isUpserting ? "" : "Conferma",
              onPress: handleConfirm,
              isLoading: isUpserting,
              disabled: isUpserting
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export type { IDPayPaymentAuthorizationScreenRouteParams };
export { IDPayPaymentAuthorizationScreen };
