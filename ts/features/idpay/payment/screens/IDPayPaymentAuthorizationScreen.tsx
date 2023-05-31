import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { usePaymentMachineService } from "../xstate/provider";
import {
  isAwaitingUserInputSelector,
  transactionDataSelector
} from "../xstate/selectors";

const IDPayPaymentAuthorizationScreen = () => {
  const machine = usePaymentMachineService();
  const transactionData = useSelector(machine, transactionDataSelector);

  // To show loading state we check if there is the need of user input with
  // isAwaitingUserInputSelector. In this way we avoid to show data for a couple
  // of frames before navigating to the next screen, which happens with isLoadingSelector
  const isAwaitingUserInput = useSelector(machine, isAwaitingUserInputSelector);

  const handleCancel = () => {
    machine.send("EXIT");
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
      <LoadingSpinnerOverlay
        isLoading={!isAwaitingUserInput}
        loadingOpacity={100}
      >
        <SafeAreaView style={IOStyles.flex}>
          <View style={IOStyles.flex}>
            <ContentWrapper>{content}</ContentWrapper>
          </View>
          <FooterWithButtons
            type="TwoButtonsInlineThird"
            leftButton={{
              title: "Annulla",
              bordered: true,
              onPress: handleCancel
            }}
            rightButton={{
              title: "Conferma",
              onPress: handleConfirm
            }}
          />
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export { IDPayPaymentAuthorizationScreen };
