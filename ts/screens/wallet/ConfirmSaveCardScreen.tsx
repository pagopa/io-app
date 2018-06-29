/**
 * This screen presents a summary on the credit card after the user
 * inserted the data required to save a new card
 */
import {
  Body,
  Button,
  Container,
  Content,
  H1,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { Switch } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect, Dispatch } from "react-redux";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import CreditCardComponent from "../../components/wallet/card";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { getNewCardData } from "../../store/reducers/wallet/cards";
import { CreditCard, UNKNOWN_CARD } from "../../types/CreditCard";
import { addCardRequest } from '../../store/actions/wallet/cards';
import ROUTES from '../../navigation/routes';

type ReduxMappedStateProps = Readonly<{
  card: Readonly<CreditCard>;
}>;

type ReduxMappedDispatchProps = Readonly<{
  addCard: () => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

type State = Readonly<{
  isFavoriteCard: boolean;
}>;

class ConfirmSaveCardScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isFavoriteCard: true
    };
  }

  // It supports switch state changes
  private onValueChange = () => {
    this.setState(prevState => ({
      isFavoriteCard: !prevState.isFavoriteCard
    }));
  };

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.saveCard.header")}</Text>
          </Body>
        </AppHeader>
        <Content>
          <H1> {I18n.t("wallet.saveCard.title")} </H1>
          <CreditCardComponent
            navigation={this.props.navigation}
            item={this.props.card}
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
                value={this.state.isFavoriteCard}
                onValueChange={this.onValueChange}
              />
            </Col>
          </Grid>
        </Content>
        <View footer={true}>
          <Button
            block={true}
            primary={true}
            onPress={
              () => {
                this.props.addCard();
                this.props.navigation.navigate(ROUTES.WALLET_HOME);
              }
            }
          >
            <Text>{I18n.t("wallet.saveCard.save")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={(): void => this.goBack()}
          >
            <Text>{I18n.t("global.buttons.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  card: getNewCardData(state).getOrElse(UNKNOWN_CARD)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  addCard: () => dispatch(addCardRequest())
})

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmSaveCardScreen);
