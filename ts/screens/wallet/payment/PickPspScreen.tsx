import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import {
  Body,
  Container,
  Content,
  H1,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import GoBackButton from "../../../components/GoBackButton";
import { InstabugButtons } from "../../../components/InstabugButtons";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestCancel,
  paymentRequestGoBack,
  paymentUpdatePsp
} from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";
import { Psp, Wallet } from "../../../types/pagopa";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../utils/stringBuilder";

type NavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  pspList: ReadonlyArray<Psp>;
  wallet: Wallet;
  paymentId: string;
}>;

type ReduxMappedDispatchProps = Readonly<{
  pickPsp: (pspId: number, wallet: Wallet, paymentId: string) => void;
  goBack: () => void;
  onCancel: () => void;
}>;

type Props = ReduxMappedDispatchProps &
  NavigationInjectedProps<NavigationParams>;

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
    fontSize: variables.fontSize2
  },

  flexStart: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: 100,
    height: 50
  }
});

class PickPspScreen extends React.Component<Props> {
  public render(): React.ReactNode {
    const wallet = this.props.navigation.getParam("wallet");
    const paymentId = this.props.navigation.getParam("paymentId");
    const allPspList = this.props.navigation.getParam("pspList");

    // The PaymentManager returns a PSP entry for each supported language, so
    // we need to skip PSPs that have the language different from the current
    // locale.
    const locale = I18n.locale.slice(0, 2);
    const pspList = allPspList.filter(
      _ => (_.lingua ? _.lingua.toLowerCase() === locale : true)
    );

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton onPress={this.props.goBack} />
          </Left>
          <Body>
            <Text>{I18n.t("saveCard.saveCard")}</Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>

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
            data={pspList}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => this.props.pickPsp(item.id, wallet, paymentId)}
              >
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
      </Container>
    );
  }
}

const mapDispatchToProps = (
  dispatch: Dispatch,
  props: Props
): ReduxMappedDispatchProps => ({
  pickPsp: (pspId: number, wallet: Wallet, paymentId: string) =>
    dispatch(
      paymentUpdatePsp({
        pspId,
        wallet,
        paymentId,
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount"),
        verifica: props.navigation.getParam("verifica")
      })
    ),
  goBack: () => dispatch(paymentRequestGoBack()),
  onCancel: () => dispatch(paymentRequestCancel())
});

export default connect(
  undefined,
  mapDispatchToProps
)(PickPspScreen);
