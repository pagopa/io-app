import { View } from "react-native";
import { SendQRScanFlowHandlerComponentProps } from "../SendQRScanFlowHandlerComponent";

export const SendQRScanFlowHandlerComponent = ({
  aarUrl
}: SendQRScanFlowHandlerComponentProps) => (
  <View>
    <View>{"Mock SendQRScanFlowHandlerComponent"}</View>
    <View>{aarUrl}</View>
  </View>
);
