/**
 * AWESOME PA
 * A React Native App
 *
 * @flow
 */

import * as React from 'react';
import {
    View,
    Button,
    Container,
    StyleProvider, Grid, Row, Header, Content, List, ListItem, Text, Icon, Left, Body, Right, Switch } from "native-base";
import {Image,TouchableHighlight} from 'react-native';
import type {NavigationScreenProp, NavigationState} from "react-navigation";

/* import images */
import bankLogo from "../../../img/portfolio/add-method/bank.png";
import creditCardLogo from "../../../img/portfolio/add-method/creditcard.png";
import mobileLogo from "../../../img/portfolio/add-method/mobile.png";

// import AweTabsLayout from "../com§ponents/tabslayout";
import PortfolioStyles from "../../components/styles";
// import CustomLayout from "../components/custom-layout";
import I18n from '../../i18n'
import ROUTES from '../../navigation/routes'

import SimpleLayout from '../../components/portfolio/SimpleLayout'


type Props = {
    navigation: NavigationScreenProp<NavigationState>
};

class AddPaymentMethodScreen extends React.Component<Props>
{
    static navigationOptions = {
        title: I18n.t('portfolio.addPaymentMethodTitle'),
        headerBackTitle: null
    }

    render(): React.Node
    {
        const {navigate} = this.props.navigation;
        const paymentMethods = [
            {
                navigateTo: ROUTES.PORTFOLIO_ADD_CARD,
                name: I18n.t('portfolio.methods.card.name'),
                maxFee: I18n.t('portfolio.methods.card.maxFee'),
                icon: creditCardLogo
            },
            {
                navigateTo: 'Test',
                name: I18n.t('portfolio.methods.bank.name'),
                maxFee: I18n.t('portfolio.methods.bank.maxFee'),
                icon: bankLogo
            },
            {
                navigateTo: 'Test',
                name: I18n.t('portfolio.methods.mobile.name'),
                maxFee: I18n.t('portfolio.methods.mobile.maxFee'),
                icon: mobileLogo
            },
        ];

        return (
            <Content>
                <List
                    style={{padding:0, margin:0}}
                    removeClippedSubviews={false}
                    dataArray = {paymentMethods}
                    renderRow = {(item) => 
                        <ListItem style={{marginLeft: 0, flex:1, paddingRight: 0}} onPress={()=> navigate(item.navigateTo)} >
                        <Left>
                            <Grid>
                                <Row>
                                    <Text style={PortfolioStyles.payBoldStyle}>{item.name}</Text>
                                </Row>
                                <Row>
                                    <Text style={PortfolioStyles.payLightStyle}>{item.maxFee}</Text>
                                </Row>
                            </Grid>
                        </Left>
                        <Right style={{alignItems:"center"}}>
                            <Image source={item.icon} style={{resizeMode:"contain"}}/>
                        </Right>
                    </ListItem>
                    }>
                </List>
                <Text style={PortfolioStyles.linkStyle} onPress={()=>navigate('NavigationTest')}>{I18n.t('portfolio.whyFee')}</Text>  
            </Content>

        );           
                 
    }
}

export default AddPaymentMethodScreen;
