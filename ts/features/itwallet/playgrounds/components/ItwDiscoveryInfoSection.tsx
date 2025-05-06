import { ListItemHeader, ListItemNav } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useCallback } from "react";
import { ItwEidIssuanceMachineContext } from "../../machine/provider";

export const ItwDiscoveryInfoSection = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "start" });
  }, [machineRef]);

  return (
    <View>
      <ListItemHeader label="Discovery info screen" />
      <ListItemNav
        value="Discovery"
        description="Navigate to the Discovery info screen"
        onPress={handleOnPress}
      />
    </View>
  );
};
