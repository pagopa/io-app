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
import { connect } from "react-redux";
import AppHeader from "../../components/ui/AppHeader";
import IconFont from "../../components/ui/IconFont";
import CreditCardComponent from "../../components/wallet/card";
import I18n from "../../i18n";
import { GlobalState } from "../../store/reducers/types";
import { selectedCreditCardSelector } from "../../store/reducers/wallet/cards";
import { CreditCard, UNKNOWN_CARD } from "../../types/CreditCard";

type ReduxMappedStateProps = Readonly<{
  card: Readonly<CreditCard>;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps;

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
          <Button block={true} primary={true}>
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

/**
 * selectedCreditCardSelector has to be substitute with the proper selector
 */
const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  card: selectedCreditCardSelector(state).getOrElse(UNKNOWN_CARD)
});
export default connect(mapStateToProps)(ConfirmSaveCardScreen);
