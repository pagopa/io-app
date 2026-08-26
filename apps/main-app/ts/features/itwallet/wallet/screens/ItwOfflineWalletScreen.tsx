import { HeaderFirstLevel } from "@io-app/design-system";
import I18n from "i18next";
import { useEffect } from "react";

import {
  IOScrollView,
  IOScrollViewActions
} from "../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackItwProximityShowQrCode } from "../../presentation/proximity/analytics";
import { ITW_PROXIMITY_ROUTES } from "../../presentation/proximity/navigation/routes";
import { hasPresentableCredentialsSelector } from "../../presentation/proximity/store/selectors/credentials";
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

  const hasPresentableCredentials = useIOSelector(
    hasPresentableCredentialsSelector
  );
  const proximityActionProps: IOScrollViewActions["primary"] | undefined =
    hasPresentableCredentials
      ? {
          label: I18n.t("features.itWallet.presentation.ctas.present"),
          icon: "productITWallet",
          iconPosition: "end",
          onPress: () => {
            trackItwProximityShowQrCode({
              credential: "general",
              position: "WALLET_HOME"
            });
            navigation.navigate(ITW_PROXIMITY_ROUTES.MAIN, {
              screen: ITW_PROXIMITY_ROUTES.PRESENTMENT,
              params: {
                source: "WALLET_HOME"
              }
            });
          }
        }
      : undefined;

  return (
    <>
      <HeaderFirstLevel
        actions={[]}
        ignoreSafeAreaMargin={true}
        title={I18n.t("wallet.wallet")}
      />
      <IOScrollView
        actions={
          proximityActionProps
            ? { type: "SingleButton", primary: proximityActionProps }
            : undefined
        }
        excludeSafeAreaMargins={true}
      >
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
