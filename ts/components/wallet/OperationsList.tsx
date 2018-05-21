/**
 * This component displays a list of transactions
 */
// TODO: define the most suitable term for "transactions" 
// (transactions, operations, payments, or something else entirely)
// and stick with it throughout the code
import {
  Body,
  Grid,
  Icon,
  Left,
  List,
  ListItem,
  Right,
  Row,
  Text
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../i18n";
import { Operation } from "../../types/wallet";
import { WalletStyles } from "../styles/wallet";

type Props = Readonly<{
  parent: string;
  title: string;
  totalAmount: string;
  navigation: NavigationScreenProp<NavigationState>;
  operations: ReadonlyArray<Operation>;
}>;

type State = Readonly<{
  data: ReadonlyArray<Operation>;
}>;

/**
 * Operations' List component
 */
export class OperationsList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { data: Array.from(props.operations) };
  }

  private renderDate(operation: Operation) {
    const datetime: string = `${operation.date} - ${operation.time}`;
    if (operation.isNew) {
      return (
        <Row>
          <Icon
            type="FontAwesome"
            name="circle"
            active={true}
            style={WalletStyles.newIconStyle}
          />
          <Text note={true}>{datetime}</Text>
        </Row>
      );
    }
    return (
      <Row>
        <Text note={true}>{datetime}</Text>
      </Row>
    );
  }

  public render(): React.ReactNode {
    const { navigate } = this.props.navigation;
    const ops = this.state.data;

    if (ops.length === 0) {
      return <Text>{I18n.t("wallet.noTransactions")}</Text>;
    }

    return (
      <Grid>
        <Row>
          <Left>
            <Text style={WalletStyles.boldStyle}>{this.props.title}</Text>
          </Left>
          <Right>
            <Text>{this.props.totalAmount}</Text>
          </Right>
        </Row>
        <Row>
          <List
            removeClippedSubviews={false}
            dataArray={ops as any[]} // tslint:disable-line
            renderRow={(item): React.ReactElement<any> => (
              <ListItem onPress={(): boolean => navigate("")}>
                <Body>
                  <Grid>
                    {this.renderDate(item)}
                    <Row>
                      <Left>
                        <Text>{item.subject}</Text>
                      </Left>
                      <Right>
                        <Text>
                          {item.amount} {item.currency}
                        </Text>
                      </Right>
                    </Row>
                    <Row>
                      <Text note={true}>{item.location}</Text>
                    </Row>
                  </Grid>
                </Body>
              </ListItem>
            )}
          />
        </Row>
      </Grid>
    );
  }
}
