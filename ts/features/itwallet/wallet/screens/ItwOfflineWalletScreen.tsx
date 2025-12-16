import { HeaderFirstLevel } from "@pagopa/io-app-design-system";
import { useEffect } from "react";
import I18n from "i18next";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackItwOfflineWallet } from "../../analytics";
import { ItwOfflineAccessGate } from "../components/ItwOfflineAccessGate.tsx";
import { ItwWalletCardsContainer } from "../components/ItwWalletCardsContainer";

const OfflineWalletScreenContent = () => {
  const navigation = useIONavigation();

  useOnFirstRender(() => {
    trackItwOfflineWallet();
  });

  useEffect(() => {
    // Ensures that no header is displayed other than the one mounted by the screen
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

export const ItwOfflineWalletScreen = () => (
  <ItwOfflineAccessGate>
    <OfflineWalletScreenContent />
  </ItwOfflineAccessGate>
);
