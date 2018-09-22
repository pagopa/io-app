/**
 * This screen allows to identify the proper manager for a credit card
 * when it is added to the user wallet
 */

import { Body, Container, Content, H1, Left, Text, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import GoBackButton from "../../../components/GoBackButton";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import { WalletStyles } from "../../../components/styles/wallet";
import AppHeader from "../../../components/ui/AppHeader";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  paymentRequestGoBack,
  paymentUpdatePsp
} from "../../../store/actions/wallet/payment";
import { createLoadingSelector } from "../../../store/reducers/loading";
import { GlobalState } from "../../../store/reducers/types";
import {
  getPaymentStep,
  getPspList,
  isGlobalStateWithSelectedPaymentMethod
} from "../../../store/reducers/wallet/payment";
import variables from "../../../theme/variables";
import { Psp } from "../../../types/pagopa";
import { buildAmount, centsToAmount } from "../../../utils/stringBuilder";

type ReduxMappedStateProps =
  | Readonly<{
      valid: true;
      pspList: ReadonlyArray<Psp>;
    }>
  | Readonly<{ valid: false }>;

type ReduxMappedDispatchProps = Readonly<{
  pickPsp: (pspId: number) => void;
  goBack: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

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
  private itemSeparator = () => <View style={WalletStyles.bottomBorder} />;
  private itemKey = (item: Psp) => item.id.toString();
  private pickPsp = (item: Psp) => () => this.props.pickPsp(item.id);
  private renderItem = (itemInfo: ListRenderItemInfo<Psp>) => (
    <TouchableOpacity onPress={this.pickPsp(itemInfo.item)}>
      <View style={style.listItem}>
        <Grid>
          <Col size={6}>
            <View spacer={true} />
            <Row>
              <Image
                style={style.flexStart}
                resizeMode={"contain"}
                source={{ uri: itemInfo.item.logoPSP }}
              />
            </Row>
            <Row>
              <Text style={style.feeText}>
                {`${I18n.t("wallet.pickPsp.maxFee")} `}
                <Text bold={true} style={style.feeText}>
                  {buildAmount(centsToAmount(itemInfo.item.fixedCost.amount))}
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
  );

  public shouldComponentUpdate(nextProps: Props) {
    // avoids updating the component on invalid props to avoid having the screen
    // become blank during transitions from one payment state to another
    // FIXME: this is quite fragile, we should instead avoid having a shared state
    return nextProps.valid;
  }

  public render(): React.ReactNode {
    if (!this.props.valid) {
      return null;
    }

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton onPress={this.props.goBack} />
          </Left>
          <Body>
            <Text>{I18n.t("saveCard.saveCard")}</Text>
          </Body>
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
            ItemSeparatorComponent={this.itemSeparator}
            removeClippedSubviews={false}
            numColumns={1}
            data={this.props.pspList}
            keyExtractor={this.itemKey}
            renderItem={this.renderItem}
          />
        </Content>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps =>
  getPaymentStep(state) === "PaymentStatePickPsp" &&
  isGlobalStateWithSelectedPaymentMethod(state)
    ? {
        valid: true,
        pspList: getPspList(state)
      }
    : { valid: false };

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  pickPsp: (pspId: number) => dispatch(paymentUpdatePsp(pspId)),
  goBack: () => dispatch(paymentRequestGoBack())
});
export default withLoadingSpinner(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(PickPspScreen),
  createLoadingSelector(["PAYMENT_LOAD"]),
  {}
);
