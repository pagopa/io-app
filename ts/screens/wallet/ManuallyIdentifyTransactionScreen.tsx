/**
 * This screen allows the user to manually insert the data which identify the transaction:
 * - Numero Avviso, which includes: aux, digit, application code, codice IUV
 * - Codice Fiscale Ente CReditore (corresponding to codiceIdentificativoEnte)
 * - amount of the transaction
 *  TO DO:
 *  - integrate contextual help to obtain details on the data to insert for manually identifying the transaction
 *    https://www.pivotaltracker.com/n/projects/2048617/stories/157874540
 */

import { none, Option, some } from "fp-ts/lib/Option";
import {
  Body,
  Button,
  Container,
  Content,
  Form,
  H1,
  Icon,
  Input,
  Item,
  Label,
  Left,
  Text,
  View
} from "native-base";
import * as React from "react";
import { NavigationScreenProps, NavigationState } from "react-navigation";
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

type OwnProps = NavigationScreenProps<NavigationState>;

type Props = OwnProps;

type State = Readonly<{
  transactionCode: Option<string>;
  fiscalCode: Option<string>;
  amount: Option<string>;
}>;

export class ManuallyIdentifyTransactionScreen extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      transactionCode: none,
      fiscalCode: none,
      amount: none
    };
  }

  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true} onPress={() => this.goBack()}>
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t("wallet.insertManually.header")}</Text>
          </Body>
        </AppHeader>
        <Content>
          <H1>{I18n.t("wallet.insertManually.title")}</H1>
          <Text>{I18n.t("wallet.insertManually.info")}</Text>
          <Text link={true}>{I18n.t("wallet.insertManually.link")}</Text>
          <Form>
            <Item floatingLabel={true}>
              <Label>{I18n.t("wallet.insertManually.noticeCode")}</Label>
              <Input
                keyboardType={"numeric"}
                onChangeText={value => {
                  this.setState({ transactionCode: some(value) });
                }}
              />
            </Item>
            <Item floatingLabel={true}>
              <Label>{I18n.t("wallet.insertManually.entityCode")}</Label>
              <Input
                keyboardType={"numeric"}
                onChangeText={value => {
                  this.setState({ fiscalCode: some(value) });
                }}
              />
            </Item>
            <Item floatingLabel={true}>
              <Label>{I18n.t("wallet.insertManually.amount")}</Label>
              <Input
                keyboardType={"numeric"}
                onChangeText={value => {
                  this.setState({ amount: some(value) });
                }}
              />
            </Item>
          </Form>
        </Content>
        <View footer={true}>
          <Button block={true} primary={true}>
            <Text>{I18n.t("wallet.insertManually.proceed")}</Text>
          </Button>
          <View spacer={true} />
          <Button
            block={true}
            light={true}
            bordered={true}
            onPress={() => this.props.navigation.navigate(ROUTES.WALLET_HOME)}
          >
            <Text>{I18n.t("wallet.cancel")}</Text>
          </Button>
        </View>
      </Container>
    );
  }
}
