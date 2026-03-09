import { Text, View } from "react-native";
import { SendAARCieCardReadingComponentProps } from "../SendAARCieCardReadingComponent";

export const SendAARCieCardReadingComponent = ({
  can,
  verificationCode,
  iun,
  recipientInfo,
  mandateId
}: SendAARCieCardReadingComponentProps) => (
  <View>
    <Text>Mock SendAARCieCardReadingComponent</Text>
    <Text>{`can: ${can}`}</Text>
    <Text>{`varificationCode: ${verificationCode}`}</Text>
    <Text>{`iun: ${iun}`}</Text>
    <Text>{`recipientInfo.denomination: ${recipientInfo.denomination}`}</Text>
    <Text>{`recipientInfo.taxId: ${recipientInfo.taxId}`}</Text>
    <Text>{`mandateId: ${mandateId}`}</Text>
  </View>
);
