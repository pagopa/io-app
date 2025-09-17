import { View } from "react-native";
import { SendQRScanHandlerScreenProps } from "../SendQRScanFlowHandlerComponent";

export const SendQRScanFlowHandlerComponent = ({
  aarUrl
}: SendQRScanHandlerScreenProps) => (
  <View>
    <View>{"Mock SendQRScanFlowHandlerComponent"}</View>
    <View>{aarUrl}</View>
  </View>
);
