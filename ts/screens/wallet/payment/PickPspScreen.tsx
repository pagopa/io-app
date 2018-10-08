/**
 * This screen allows to identify the proper manager for a credit card
 * when it is added to the user wallet
 */

import { none, Option } from "fp-ts/lib/Option";
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
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import GoBackButton from "../../../components/GoBackButton";
import { withErrorModal } from "../../../components/helpers/withErrorModal";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
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
import { createErrorSelector } from "../../../store/reducers/error";
import { createLoadingSelector } from "../../../store/reducers/loading";
import { GlobalState } from "../../../store/reducers/types";
import {
  getPaymentIdFromGlobalStateWithSelectedPaymentMethod,
  getPaymentStep,
  getPspListFromGlobalStateWithSelectedPaymentMethod,
  getSelectedPaymentMethodFromGlobalStateWithSelectedPaymentMethod,
  isGlobalStateWithSelectedPaymentMethod
} from "../../../store/reducers/wallet/payment";
import variables from "../../../theme/variables";
import { mapErrorCodeToMessage } from "../../../types/errors";
import { Psp, Wallet } from "../../../types/pagopa";
import { buildAmount, centsToAmount } from "../../../utils/stringBuilder";

type ReduxMappedStateProps = Readonly<{
  isLoading: boolean;
  error: Option<string>;
}> &
  (
    | Readonly<{
        valid: true;
        pspList: ReadonlyArray<Psp>;
        wallet: Wallet;
        paymentId: string;
      }>
    | Readonly<{ valid: false }>);

type ReduxMappedDispatchProps = Readonly<{
  pickPsp: (pspId: number, wallet: Wallet, paymentId: string) => void;
  goBack: () => void;
  onCancel: () => void;
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

class PickPspScreen extends React.Component<Props, never> {
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

    const { wallet, paymentId } = this.props;

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
            data={this.props.pspList}
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
                            {buildAmount(centsToAmount(item.fixedCost.amount))}
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

function mapStateToProps() {
  const paymetErrorSelector = createErrorSelector(["PAYMENT"]);
  const paymentLoadingSelector = createLoadingSelector(["PAYMENT"]);
  return (state: GlobalState): ReduxMappedStateProps => {
    const error = paymetErrorSelector(state);
    const isLoading = paymentLoadingSelector(state);

    if (
      getPaymentStep(state) === "PaymentStatePickPsp" &&
      isGlobalStateWithSelectedPaymentMethod(state)
    ) {
      // The PaymentManager returns a PSP entry for each supported language, so
      // we need to skip PSPs that have the language different from the current
      // locale.
      const locale = I18n.locale.slice(0, 2);
      const pspList = getPspListFromGlobalStateWithSelectedPaymentMethod(
        state
      ).filter(_ => (_.lingua ? _.lingua.toLowerCase() === locale : true));
      return {
        valid: true,
        error,
        isLoading,
        pspList,
        wallet: getSelectedPaymentMethodFromGlobalStateWithSelectedPaymentMethod(
          state
        ),
        paymentId: getPaymentIdFromGlobalStateWithSelectedPaymentMethod(state)
      };
    } else {
      return { valid: false, error: none, isLoading: false };
    }
  };
}

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  pickPsp: (pspId: number, wallet: Wallet, paymentId: string) =>
    dispatch(paymentUpdatePsp({ pspId, wallet, paymentId })),
  goBack: () => dispatch(paymentRequestGoBack()),
  onCancel: () => dispatch(paymentRequestCancel())
});

export default connect(
  mapStateToProps(),
  mapDispatchToProps
)(withErrorModal(withLoadingSpinner(PickPspScreen, {}), mapErrorCodeToMessage));
