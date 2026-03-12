import { useCallback } from "react";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  itwCredentialsEidIssuedAtSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";

export const ItwWalletIdCard = () => {
  const navigation = useIONavigation();
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const eidIssuedAt = useIOSelector(itwCredentialsEidIssuedAtSelector);

  const handlePress = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.PID_DETAIL
    });
  }, [navigation]);

  return (
    <WalletCardPressableBase onPress={handlePress}>
      <ItwCredentialCard
        credentialType={CredentialType.PID}
        credentialStatus={eidStatus}
        issuedAt={eidIssuedAt}
      />
    </WalletCardPressableBase>
  );
};
