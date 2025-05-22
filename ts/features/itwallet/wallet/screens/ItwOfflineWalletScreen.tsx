import { HeaderFirstLevel } from "@pagopa/io-app-design-system";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import I18n from "../../../../i18n";
import { ItwWalletCardsContainer } from "../components/ItwWalletCardsContainer";
import { withOfflineAlert } from "../../common/helpers/withOfflineAlert";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackItwOfflineWallet } from "../../analytics";

const ItwOfflineWalletScreen = () => {
  useOnFirstRender(() => {
    trackItwOfflineWallet();
  });

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
