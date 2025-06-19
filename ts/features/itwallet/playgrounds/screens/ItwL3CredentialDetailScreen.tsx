import {
  CredentialL3Key,
  ItwStoredCredentialsMocks
} from "../../common/utils/itwMocksUtils";
import { ItwPresentationCredentialDetail } from "../../presentation/details/screens/ItwPresentationCredentialDetailScreen";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList.ts";
import { ItwPlaygroundParamsList } from "../navigation/ItwPlaygroundParamsList.ts";
import { useItwPresentQRCode } from "../../presentation/proximity/hooks/useItwPresentQRCode.tsx";

export type ItwL3CredentialDetailScreenNavigationParams = {
  credentialType: CredentialL3Key;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwPlaygroundParamsList,
  "ITW_PLAYGROUND_CREDENTIAL_DETAIL"
>;

export const ItwL3CredentialDetailScreen = (params: ScreenProps) => {
  const { credentialType } = params.route.params;
  const { bottomSheet } = useItwPresentQRCode();

  const credential = ItwStoredCredentialsMocks.L3[credentialType];

  return (
    <>
      <ItwPresentationCredentialDetail credential={credential} />
      {bottomSheet}
    </>
  );
};
