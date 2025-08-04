import { View } from "react-native";
import { SendQRScanRedirectComponentProps } from "../SendQRScanRedirectComponent";

export const SendQRScanRedirectComponent = ({
  aarUrl
}: SendQRScanRedirectComponentProps) => (
  <View>
    <View>{"Mock SendQRScanRedirectComponent"}</View>
    <View>{aarUrl}</View>
  </View>
);
