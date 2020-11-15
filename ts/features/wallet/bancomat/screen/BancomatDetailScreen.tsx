import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import DarkLayout from "../../../../components/screens/DarkLayout";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { EnhancedBancomat } from "../../../../store/reducers/wallet/wallets";
import GoToTransactions from "../../../bonus/bpd/screens/details/transaction/GoToTransactions";
import BancomatCard from "../component/bancomatCard/BancomatCard";

type NavigationParams = Readonly<{
  bancomat: EnhancedBancomat;
}>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<NavigationParams>;

const styles = StyleSheet.create({
  cardContainer: {
    height: 235,
    width: "100%",
    position: "absolute",
    top: 16,
    zIndex: 7,
    elevation: 7,
    alignItems: "center"
  },
  headerSpacer: {
    height: 172
  }
});

/**
 * Detail screen for a bancomat
 * @constructor
 */
const BancomatDetailScreen: React.FunctionComponent<Props> = props => {
  const bancomat = props.navigation.getParam("bancomat");
  return (
    <DarkLayout
      bounces={false}
      title={I18n.t("wallet.methods.card.shortName")}
      faqCategories={["wallet_methods"]}
      allowGoBack={true}
      topContent={<View style={styles.headerSpacer} />}
      gradientHeader={true}
      hideHeader={true}
      footerContent={<GoToTransactions />}
    >
      <View style={styles.cardContainer}>
        <BancomatCard bancomat={bancomat} />
      </View>
    </DarkLayout>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatDetailScreen);
