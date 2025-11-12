import { VStack } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { ItwWalletIdStatus } from "../../wallet/components/ItwWalletIdStatus";

export const ItwWalletIdStatusSection = () => (
  <View
    style={{
      marginHorizontal: -24,
      paddingHorizontal: 24,
      paddingBottom: 24
    }}
  >
    <VStack space={8}>
      <ItwWalletIdStatus pidStatus="valid" />
      <ItwWalletIdStatus
        pidStatus="jwtExpiring"
        pidExpiration="2026-11-12T14:11:48.000Z"
      />
      <ItwWalletIdStatus pidStatus="jwtExpired" />
    </VStack>
  </View>
);
