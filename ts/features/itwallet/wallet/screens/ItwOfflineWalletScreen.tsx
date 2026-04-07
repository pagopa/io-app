import { HeaderFirstLevel } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect } from "react";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackItwOfflineWallet } from "../analytics";
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
        actions={[]}
        ignoreSafeAreaMargin={true}
        title={I18n.t("wallet.wallet")}
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
