import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, H1, Text, View } from "native-base";
import * as React from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";

import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import { WalletStyles } from "../../../components/styles/wallet";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import { Psp, Wallet } from "../../../types/pagopa";
import { showToast } from "../../../utils/showToast";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../utils/stringBuilder";
import { dispatchUpdatePspForWalletAndConfirm } from "./common";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  idPayment: string;
  psps: ReadonlyArray<Psp>;
  wallet: Wallet;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  OwnProps;

const style = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    flex: 1,
    paddingRight: 0
  },

  icon: {
    flexDirection: "row",
    alignItems: "center"
  },

  feeText: {
    color: variables.brandDarkGray,
    fontSize: variables.fontSizeSmall
  },

  flexStart: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: 100,
    height: 50
  }
});

/**
 * Select a PSP to be used for a the current selected wallet
 */
class PickPspScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    const availablePsps = this.props.navigation.getParam("psps");

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("saveCard.saveCard")}
      >
        <Content>
          <H1>{I18n.t("wallet.pickPsp.title")}</H1>
          <View spacer={true} />
          <Text>
            {`${I18n.t("wallet.pickPsp.info")} `}
            <Text bold={true}>{`${I18n.t("wallet.pickPsp.infoBold")} `}</Text>
            <Text>{`${I18n.t("wallet.pickPsp.info2")} `}</Text>
            <Text link={true}>{I18n.t("wallet.pickPsp.link")}</Text>
          </Text>
          <View spacer={true} />
          <FlatList
            ItemSeparatorComponent={() => (
              <View style={WalletStyles.bottomBorder} />
            )}
            removeClippedSubviews={false}
            numColumns={1}
            data={availablePsps}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => this.props.pickPsp(item.id)}>
                <View style={style.listItem}>
                  <Grid>
                    <Col size={6}>
                      <View spacer={true} />
                      <Row>
                        <Image
                          style={style.flexStart}
                          resizeMode={"contain"}
                          source={{ uri: item.logoPSP }}
                        />
                      </Row>
                      <Row>
                        <Text style={style.feeText}>
                          {`${I18n.t("wallet.pickPsp.maxFee")} `}
                          <Text bold={true} style={style.feeText}>
                            {formatNumberAmount(
                              centsToAmount(item.fixedCost.amount)
                            )}
                          </Text>
                        </Text>
                      </Row>
                      <View spacer={true} />
                    </Col>
                    <Col size={1} style={style.icon}>
                      <IconFont name="io-right" />
                    </Col>
                  </Grid>
                </View>
              </TouchableOpacity>
            )}
          />
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isLoading: pot.isLoading(state.wallet.wallets.walletById)
});

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  return {
    pickPsp: (idPsp: number) =>
      dispatchUpdatePspForWalletAndConfirm(dispatch)(
        idPsp,
        props.navigation.getParam("wallet"),
        props.navigation.getParam("rptId"),
        props.navigation.getParam("initialAmount"),
        props.navigation.getParam("verifica"),
        props.navigation.getParam("idPayment"),
        props.navigation.getParam("psps"),
        () =>
          showToast(I18n.t("wallet.pickPsp.onUpdateWalletPspFailure"), "danger")
      ),
    onCancel: () => props.navigation.goBack()
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(PickPspScreen));
