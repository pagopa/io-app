import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { IOColors } from "../../../../components/core/variables/IOColors";
import DarkLayout from "../../../../components/screens/DarkLayout";
import { GlobalState } from "../../../../store/reducers/types";
import { CreditCardPaymentMethod } from "../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useRemovePaymentMethodBottomSheet } from "../../component/RemovePaymentMethod";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import PaymentMethodCapabilities from "../../component/PaymentMethodCapabilities";

type NavigationParams = Readonly<{
  cobadge: CreditCardPaymentMethod;
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
  },
  cancelButton: {
    borderColor: IOColors.red,
    width: "100%"
  }
});
/**
 * Detail screen for a cobadge card
 * @constructor
 */
const CobadgeDetailScreen: React.FunctionComponent<Props> = props => {
  const cobadge: CreditCardPaymentMethod = props.navigation.getParam("cobadge");

  return (
    <DarkLayout
      bounces={false}
      contextualHelp={emptyContextualHelp}
      title={I18n.t("wallet.methods.bancomatPay.name")}
      faqCategories={["wallet_methods"]}
      allowGoBack={true}
      topContent={<View style={styles.headerSpacer} />}
      gradientHeader={true}
      hideHeader={true}
    >
      <View style={styles.cardContainer}></View>
      <View spacer={true} extralarge={true} />
      <View style={IOStyles.horizontalContentPadding}>
        <PaymentMethodCapabilities paymentMethod={cobadge} />
        <View spacer={true} />
        <View spacer={true} large={true} />
      </View>
      <View spacer={true} extralarge={true} />
    </DarkLayout>
  );
};
const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CobadgeDetailScreen);
