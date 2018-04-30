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
    Content,
    Grid,
    Row,
    Col,
    Text,
    Item,
    Left,
    Right,
    Input
} from "native-base";
import { FlatList, Image,TextInput, View } from "react-native";
import type { NavigationScreenProp, NavigationState} from "react-navigation";
// import AweTabsLayout from "../components/tabslayout";
import Icon from 'react-native-vector-icons/FontAwesome';
import I18n from '../../i18n'
import ROUTES from '../../navigation/routes'
import { withNavigation } from 'react-navigation'


type Props = {
    navigation: NavigationScreenProp<NavigationState>
};

type State = {
    cardNumber: string,
    expireDate: string,
    secureCode: string,
    cardHolder: string
}

class AddCardScreen extends React.Component<Props,State>
{
    static navigationOptions = {
        title: I18n.t('portfolio.addCardTitle'),
        headerBackTitle: null
    }

    state: State = {
        cardNumber: "",
        expireDate: "",
        secureCode: "",
        cardHolder: ""
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
            <Item style={{borderBottomWidth: 0, marginTop: 5, marginRight: 5, marginLeft: 5,padding:0}}>
                <Text>{I18n.t('portfolio.dummyCard.labels.name')}</Text>
            </Item>
            <Item style={{borderBottomWidth: 3, borderBottomColor:'#000000', marginRight: 5, marginLeft: 5}}>
                <Icon style={{marginTop:3, marginRight:3, marginBottom:3}} name='user' type='Feather'/>
                <Input onValueChange={(value)=>{this.setState({cardHolder: value})}} fontWeight={"bold"} autoCapitalize={"words"} placeholder={I18n.t('portfolio.dummyCard.values.name')}/>
            </Item>
            <Item style={{borderBottomWidth: 0, marginTop: 5, marginRight: 5, marginLeft: 5}}>
                <Text>{I18n.t('portfolio.dummyCard.labels.number')}</Text>
            </Item>
            <Item style={{borderBottomWidth: 1, marginRight: 5, marginLeft: 5}}>
                <Icon style={{marginTop:3, marginRight:3, marginBottom:3}} name='credit-card' type='Feather'/>
                <Input onValueChange={(value)=>{this.setState({cardNumber: value})}} keyboardType={"numeric"} placeholderTextColor={"#D0D6DB"} placeholder={I18n.t('portfolio.dummyCard.values.number')}/>
            </Item>
            <Item style={{borderBottomWidth: 0, marginTop: 5, marginRight: 5, marginLeft: 5}}>
            <Grid>
                <Col>
                    <Item style={{borderBottomWidth: 0, marginTop: 5,  marginRight: 5, marginLeft: 5}}>
                        <Text>{I18n.t('portfolio.dummyCard.labels.expires')}</Text>
                    </Item>
                    <Item style={{borderBottomWidth: 1, marginRight: 5, marginLeft: 5}}>
                        <Icon style={{marginTop:3, marginRight:3, marginBottom:3}} name='calendar' type='Feather'/>
                        <Input  onValueChange={(value)=>{this.setState({expireDate: value})}} placeholderTextColor={"#D0D6DB"} placeholder={I18n.t('portfolio.dummyCard.values.expires')}/>
                    </Item>
                </Col>
                <Col>
                    <Item style={{borderBottomWidth: 0, marginTop: 5,  marginRight: 5, marginLeft: 5}}>
                        <Text>{I18n.t('portfolio.dummyCard.labels.csc')}</Text>
                    </Item>
                    <Item style={{borderBottomWidth: 1,marginRight: 5, marginLeft: 5}}>
                        <Icon style={{marginTop:3, marginRight:3, marginBottom:3}}  name='lock' type='Feather'/>
                        <Input onValueChange={(value)=>{this.setState({secureCode: value})}}  keyboardType={"numeric"} maxLength={3} secureTextEntry={true} placeholderTextColor={"#D0D6DB"} placeholder={I18n.t('portfolio.dummyCard.values.csc')}/>
                    </Item>
                </Col>
            </Grid>
            </Item>

            <Item style={{borderBottomWidth: 0, marginTop: 5, marginRight: 5, marginLeft: 5}}>
                <Text>{I18n.t('portfolio.acceptedCards')}</Text>
            </Item>

            <Item last style={{borderBottomWidth: 0, marginRight: 5, marginLeft: 5, marginBottom:30}}>
            <FlatList style={{alignSelf:"center"}}
                data={cardItems}
                numColumns={4}
                renderItem={
                    ({item,key}) => <Image style={{width: 60, height: 45, resizeMode:'contain', margin:5}} source={item.source}/>
                }
                keyExtractor={item => item.name}
                
            />
            </Item>

            <View footer style={{borderBottomWidth: 0, marginRight: 5, marginLeft: 5, marginTop:15, marginBottom:30}}>
                <Button block primary onPress={(): boolean=>this.props.navigation.navigate(ROUTES.PORTFOLIO_SAVE_CARD)}>
                    <Text>
                        {I18n.t('portfolio.continue')}
                    </Text>
                </Button>

                <Button block light style={{backgroundColor:"#5C6F82", marginTop: 5 }} onPress={(): boolean=>this.props.navigation.goBack()}>
                    <Text style={{color:"white"}}>
                        {I18n.t('portfolio.cancel')}
                     </Text>
                </Button>
            </View>

        </Content>
        );
    }
}

export default AddCardScreen;