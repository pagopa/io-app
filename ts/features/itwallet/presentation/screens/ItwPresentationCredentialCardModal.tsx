import React from "react";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";

export type ItwPresentationCredentialCardModalNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_CARD"
>;

const ItwPresentationCredentialCardModal = ({ route }: Props) => {
  const { credentialType: _ } = route.params;
  return <></>;
};

const MemoizedItwPresentationCredentialCardModal = React.memo(
  ItwPresentationCredentialCardModal
);

export { MemoizedItwPresentationCredentialCardModal as ItwPresentationCredentialCardModal };
