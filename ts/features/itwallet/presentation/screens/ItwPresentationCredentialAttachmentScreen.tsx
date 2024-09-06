import React from "react";
import { View } from "react-native";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";

export type ItwPresentationCredentialAttachmentNavigationParams = {
  base64: string;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_ATTACHMENT"
>;

export const ItwPresentationCredentialAttachmentScreen = ({
  route
}: ScreenProps) => {
  const { base64 } = route.params;

  return <View />;
};
