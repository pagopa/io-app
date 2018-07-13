/**
 * This screen allows the user to input the code
 * received via text from PagoPA
 */
import { none, Option, some } from "fp-ts/lib/Option";
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Input,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import AppHeader from "../../../components/ui/AppHeader";
import IconFont from "../../../components/ui/IconFont";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { Dispatch } from "../../../store/actions/types";
import { verifyOtp } from "../../../store/actions/wallet/payment";
import variables from "../../../theme/variables";

type ReduxMappedProps = Readonly<{
  verifyOtp: (otp: string) => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
  otp: Option<string>;
}>;

type Props = OwnProps & ReduxMappedProps;

const styles = StyleSheet.create({
  contentPadding: {
    paddingRight: variables.contentPadding,
    paddingLeft: variables.contentPadding
  },
  textRight: {
    textAlign: "right"
  },
  bottomBordered: {
    borderBottomWidth: 1
  }
});

class TextVerificationScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { otp: none };
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button
              transparent={true}
              onPress={() => this.props.navigation.goBack()}
            >
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.textMsg.header")}</Text>
          </Body>
        </AppHeader>

        <Content noPadded={true} scrollEnabled={false}>
          <PaymentBannerComponent navigation={this.props.navigation} />
          <View style={styles.contentPadding}>
            <View spacer={true} large={true} />
            <H1>{I18n.t("wallet.textMsg.title")}</H1>
            <View spacer={true} large={true} />

            <Grid>
              <Col>
                <Text bold={true} note={true}>
                  {I18n.t("wallet.textMsg.header")}
                </Text>
              </Col>
              <Col>
                <Text note={true} link={true} style={styles.textRight}>
                  {I18n.t("wallet.textMsg.newCode")}
                </Text>
              </Col>
            </Grid>
            <View spacer={true} />
            <Input
              style={styles.bottomBordered}
              keyboardType={"numeric"}
              onChangeText={value =>
                this.setState({ otp: value !== "" ? some(value) : none })
              }
            />
            <View spacer={true} />
            <Text>{I18n.t("wallet.textMsg.info")}</Text>
          </View>
        </Content>

        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={() => this.props.verifyOtp(this.state.otp.getOrElse(""))}
          >
            <Text>{I18n.t("global.buttons.continue")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={() => this.props.navigation.navigate(ROUTES.WALLET_HOME)}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedProps => ({
  verifyOtp: (otp: string) => dispatch(verifyOtp(otp))
});
export default connect(
  undefined,
  mapDispatchToProps
)(TextVerificationScreen);
