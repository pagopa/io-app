import { useSelector } from "@xstate/react";
import { default as React } from "react";
import { SafeAreaView, View } from "react-native";
import { ContentWrapper } from "../../../../components/core/ContentWrapper";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { usePaymentMachineService } from "../xstate/provider";
import { selectIsFailure, transactionDataSelector } from "../xstate/selectors";

const IDPayPaymentResultScreen = () => {
  const machine = usePaymentMachineService();
  const transactionData = useSelector(machine, transactionDataSelector);
  const isFailure = useSelector(machine, selectIsFailure);

  const handleClose = () => {
    machine.send("EXIT");
  };

  // TODO Debug. Screen content will be added in another PR
  const content = (
    <Body>
      {isFailure ? "Fallita! 🙁" : JSON.stringify(transactionData, null, 4)}
    </Body>
  );

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={IOStyles.flex}>
        <ContentWrapper>{content}</ContentWrapper>
      </View>
      <FooterWithButtons
        type="SingleButton"
        leftButton={{
          title: "Chiudi",
          bordered: true,
          onPress: handleClose
        }}
      />
    </SafeAreaView>
  );
};

export { IDPayPaymentResultScreen };
