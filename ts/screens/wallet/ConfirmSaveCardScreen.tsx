/**
 * This screen presents a summary on the credit card after the user
 * inserted the data required to save a new card
 */
import { Body, Container, Content, H1, Left, Text, View } from "native-base";
import * as React from "react";
import { Switch } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import GoBackButton from "../../components/GoBackButton";
import AppHeader from "../../components/ui/AppHeader";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import CardComponent from "../../components/wallet/card";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { selectedWalletSelector } from "../../store/reducers/wallet/wallets";
import { Wallet } from "../../types/pagopa";
import { UNKNOWN_CARD } from "../../types/unknown";

type ReduxMappedStateProps = Readonly<{
  wallet: Readonly<Wallet>;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps;

type State = Readonly<{
  isFavoriteWallet: boolean;
}>;

class ConfirmSaveCardScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isFavoriteWallet: true
    };
  }

  // It supports switch state changes
  private onValueChange = () => {
    this.setState(prevState => ({
      isFavoriteWallet: !prevState.isFavoriteWallet
    }));
  };

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    const primaryButtonProps = {
      block: true,
      primary: true,
      title: I18n.t("wallet.saveCard.save")
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.goBack,
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            <Text>{I18n.t("wallet.saveCard.header")}</Text>
          </Body>
        </AppHeader>
        <Content>
          <H1> {I18n.t("wallet.saveCard.title")} </H1>
          <CardComponent
            navigation={this.props.navigation}
            item={this.props.wallet}
            menu={false}
            favorite={false}
            lastUsage={false}
          />
          <View spacer={true} />
          <Grid>
            <Col size={5}>
              <Text bold={true}>{I18n.t("wallet.saveCard.infoTitle")}</Text>
              <Text>{I18n.t("wallet.saveCard.info")}</Text>
            </Col>
            <Col size={1}>
              <Switch
                value={this.state.isFavoriteWallet}
                onValueChange={this.onValueChange}
              />
            </Col>
          </Grid>
        </Content>
        <FooterWithButtons
          leftButton={primaryButtonProps}
          rightButton={secondaryButtonProps}
          inlineHalf={true}
        />
      </Container>
    );
  }
}

/**
 * selectedCreditCardSelector has to be substitute with the proper selector
 */
const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  wallet: selectedWalletSelector(state).getOrElse(UNKNOWN_CARD)
});
export default connect(mapStateToProps)(ConfirmSaveCardScreen);
