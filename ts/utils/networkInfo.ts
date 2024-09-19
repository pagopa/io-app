import { fetch } from "@react-native-community/netinfo";

export const getIsNetworkAvailable = async () => {
  const { isConnected } = await fetch();

  return isConnected;
};
