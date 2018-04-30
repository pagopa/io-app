/**
 * AWESOME PA
 * A React Native App
 *
 * @flow
 */

import * as React from "react";
import {
    Button,
    Container,
    List,
    ListItem,
    Content,
    Grid,
    Row,
    Col,
    Text,
    Form,
    Item,
    Left,
    Right,
    Input,
    Label
} from "native-base";
import { FlatList, Image,TextInput, View } from "react-native";
import type { NavigationScreenProp, NavigationState} from "react-navigation";
// import AweTabsLayout from "../components/tabslayout";
import Icon from 'react-native-vector-icons/FontAwesome';
import I18n from '../../i18n'


type Props = {
    navigation: NavigationScreenProp<NavigationState>
};

class AddCardScreen extends React.Component<Props>
{
    static navigationOptions = {
        title: I18n.t('portfolio.addCardTitle'),
        headerBackTitle: null
    }

    render():React.Node
    {
        const {navigate} = this.props.navigation;

        const cardItems = [
            {name:'amexIcon',       source: require("../../../img/portfolio/cards-icons/amex.png")},
            {name:'dinersIcon',     source: require("../../../img/portfolio/cards-icons/diners.png")},
            {name:'maestroIcon',    source: require("../../../img/portfolio/cards-icons/maestro.png")},
            {name:'mastercardIcon', source: require("../../../img/portfolio/cards-icons/mastercard.png")},
            {name:'postepayIcon',   source: require("../../../img/portfolio/cards-icons/postepay.png")},
            {name:'visaIcon',       source: require("../../../img/portfolio/cards-icons/visa.png")},
            {name:'visaEIcon',      source: require("../../../img/portfolio/cards-icons/visa-electron.png")},
        ];

        return(
        <Content>
            <Item>
                <Text>{I18n.t('portfolio.dummyCard.labels.name')}</Text>
            </Item>
            <Item>
                <Icon name='user' type='Feather'/>
                <Input placeholder={I18n.t('portfolio.dummyCard.values.name')}/>
            </Item>
            <Item>
                <Text>{I18n.t('portfolio.dummyCard.labels.number')}</Text>
            </Item>
            <Item>
                <Icon name='credit-card' type='Feather'/>
                <Input placeholder={I18n.t('portfolio.dummyCard.values.number')}/>
            </Item>
            <Item>
            <Grid>
                <Col>
                    <Item>
                        <Text>{I18n.t('portfolio.dummyCard.labels.expires')}</Text>
                    </Item>
                    <Item>
                        <Icon name='calendar' type='Feather'/>
                        <Input placeholder={I18n.t('portfolio.dummyCard.values.expires')}/>
                    </Item>
                </Col>
                <Col>
                    <Item>
                        <Text>{I18n.t('portfolio.dummyCard.labels.csc')}</Text>
                    </Item>
                    <Item>
                        <Icon name='lock' type='Feather'/>
                        <Input secureTextEntry={true} placeholder={I18n.t('portfolio.dummyCard.values.csc')}/>
                    </Item>
                </Col>
            </Grid>
            </Item>

            <Item>
                <Text>{I18n.t('portfolio.acceptedCards')}</Text>
            </Item>

            <Item>
            <FlatList 
                data={cardItems}
                numColumns={4}
                renderItem={
                    ({item,key}) => <Image style={{width: 80, height: 60, resizeMode:'contain'}} source={item.source}/>
                }
                keyExtractor={item => item.name}
                
            />
            </Item>

            <Button  block title={I18n.t('portfolio.continue')}  onPress={() => navigate('Portfolio')}>
                <Text>{I18n.t('portfolio.continue')}</Text>
            </Button> 
            <Button light block title={I18n.t('portfolio.cancel')}  onPress={() => this.props.navigation.goBack() }>
                <Text>{I18n.t('portfolio.cancel')}</Text>
            </Button>
        </Content>
        );
    }
}

export default AddCardScreen;