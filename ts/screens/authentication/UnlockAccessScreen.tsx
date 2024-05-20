import React from "react";
import { Route, useRoute } from "@react-navigation/native";
import UnlockAccessComponent, {
  UnlockAccessProps
} from "./UnlockAccessComponent";

const UnlockAccessScreen = () => {
  const route = useRoute<Route<"UNLOCK_ACCESS_SCREEN", UnlockAccessProps>>();
  const { authLevel } = route.params;

  return <UnlockAccessComponent authLevel={authLevel} />;
};

export default UnlockAccessScreen;
