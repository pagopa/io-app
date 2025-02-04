import { useLayoutEffect } from "react";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ItwWalletCardsContainer } from "../../../wallet/components/WalletCardsContainer";
import HeaderFirstLevel from "../../../../components/ui/HeaderFirstLevel";

const ItwOfflineWalletScreen = () => {
  const navigation = useIONavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <HeaderFirstLevel title={I18n.t("wallet.wallet")} />
    });
  }, [navigation]);

  return (
    <IOScrollView excludeSafeAreaMargins={true}>
      <ItwWalletCardsContainer />
    </IOScrollView>
  );
};

export { ItwOfflineWalletScreen };
