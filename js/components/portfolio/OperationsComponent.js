/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'
import I18n from '../../i18n'
import { Body, Grid, Icon, Left, List, ListItem, Right, Row, Text } from 'native-base'
import type {NavigationScreenProp, NavigationState} from "react-navigation";
import type {CreditCard, Operation} from "../../lib/portfolio/types"
import PortfolioAPI from "../../lib/portfolio/portfolio-api"
import {withNavigation} from "react-navigation";
import ROUTES from '../../navigation/routes'

type Props = {
    parent: string,
    navigation: NavigationScreenProp<NavigationState>,
    operations: ReadonlyArray<Operation>
};

/**
 * Operations' List component
 */
class OperationsList extends React.Component<Props>
{
    constructor(props: Props)
    {
        super(props);
        this.state = { data: Array.from(props.operations) }
    }

    renderDate(operation: Operation): React.Node
    {
        const datetime: string = `${operation.date} - ${operation.time}`;
        if (operation.isNew)
        {
            return (
                <Row>
                    <Icon type="FontAwesome" name="circle" active
                          style={{marginTop: 6, fontSize: 10, color: '#0066CC'}}/>
                    <Text note>{datetime}</Text>
                </Row>
            )
        }
        return <Row><Text note>{datetime}</Text></Row>
    }

    getCard(operation: Operation): ?CreditCard
    {
        return PortfolioAPI.getCreditCard(operation.cardId);
    }

    render(): React.Node
    {
        const {navigate} = this.props.navigation;
        const ops = this.state.data;

        if (ops === null || ops === undefined)
        {
            return <Text>{'Operations null.'}</Text>
        }

        if (!Array.isArray(ops) || !ops.length)
        {
            return <Text>{I18n.t('portfolio.noTransactions')}</Text>
        }

        return (
            <List removeClippedSubviews={false} dataArray={ops} renderRow={ (item): boolean =>

                <ListItem onPress={(): boolean => navigate(ROUTES.PORTFOLIO_OPERATION_DETAILS, {
                    parent: this.props.parent,
                    operation: item,
                    card: this.getCard(item) })} >
                    <Body>
                    <Grid>
                        {this.renderDate(item)}
                        <Row>
                            <Left>
                                <Text>{item.subject}</Text>
                            </Left>
                            <Right>
                                <Text>{item.amount} {item.currency}</Text>
                            </Right>
                        </Row>
                        <Row>
                            <Text note>{item.location}</Text>
                        </Row>
                    </Grid>
                    </Body>
                </ListItem>
            }
            />

        )
    }
}

export default withNavigation(OperationsList);
