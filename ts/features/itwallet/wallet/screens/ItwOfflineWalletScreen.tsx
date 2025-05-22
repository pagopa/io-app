import { HeaderFirstLevel } from "@pagopa/io-app-design-system";
import { useEffect } from "react";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import I18n from "../../../../i18n";
import { ItwWalletCardsContainer } from "../components/ItwWalletCardsContainer.tsx";
import { withOfflineAlert } from "../utils/withOfflineAlert";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender.ts";
import { trackItwOfflineWallet } from "../../analytics";
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";

const ItwOfflineWalletScreen = () => {
  const navigation = useIONavigation();

  useOnFirstRender(() => {
    trackItwOfflineWallet();
  });

  useEffect(() => {
    // Ensures that no hader is displayed other than the one mounted by the screen
    navigation.setOptions({
      headerShown: false,
      header: undefined
    });
  }, [navigation]);

  return (
    <>
      <HeaderFirstLevel
        title={I18n.t("wallet.wallet")}
        ignoreSafeAreaMargin={true}
        actions={[]}
      />
      <IOScrollView excludeSafeAreaMargins={true}>
        <ItwWalletCardsContainer />
      </IOScrollView>
    </>
  );
};

const ItwOfflineWalletScreenWithAlert = withOfflineAlert(
  ItwOfflineWalletScreen
);

export { ItwOfflineWalletScreenWithAlert as ItwOfflineWalletScreen };
