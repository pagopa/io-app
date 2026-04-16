import { Text, View } from "react-native";
import { SendAarCieCardReadingComponentProps } from "../SendAarCieCardReadingComponent";

export const SendAarCieCardReadingComponent = ({
  can,
  verificationCode,
  iun,
  recipientInfo,
  mandateId
}: SendAarCieCardReadingComponentProps) => (
  <View>
    <Text>Mock SendAarCieCardReadingComponent</Text>
    <Text>{`can: ${can}`}</Text>
    <Text>{`varificationCode: ${verificationCode}`}</Text>
    <Text>{`iun: ${iun}`}</Text>
    <Text>{`recipientInfo.denomination: ${recipientInfo.denomination}`}</Text>
    <Text>{`recipientInfo.taxId: ${recipientInfo.taxId}`}</Text>
    <Text>{`mandateId: ${mandateId}`}</Text>
  </View>
);
