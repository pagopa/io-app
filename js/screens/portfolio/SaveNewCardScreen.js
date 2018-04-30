/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import * as React from 'react'
import {Container, Grid, Col,H1, View, Button,Text} from 'native-base'
import {Switch} from 'react-native'
import ROUTES from '../../navigation/routes'
import I18n from '../../i18n'
import type { NavigationScreenProp, NavigationState } from 'react-navigation'


type Props = {
    navigation: NavigationScreenProp<NavigationState>,
    HEADER:string;
}

type State = {
    isPreferredCard: boolean
}


/**
 * Reasume data about the new card added
 */
class SaveNewCardScreen extends React.Component<Props,State> {
    state: State = {
        isPreferredCard: true
    }
    
    static navigationOptions = {
      title: I18n.t('saveCard.saveCard'),
      headerBackTitle: null
    }
    
    onValueChange(){
        this.setState({isPreferredCard: !this.state.isPreferredCard})  
    }

    constructor(props: Props) {
      super(props)
    }

    render(): React.Node {
        const { navigate } = this.props.navigation
        const HEADER = I18n.t('saveCard.header')
        const TITLE = I18n.t('saveCard.favoriteTitle')
        const TEXT = I18n.t('saveCard.favoriteText')

        return (
            <Container style={{backgroundColor: 'white'}}>
                <H1 style={{margin:15}}>{HEADER}</H1>
                <Grid  style={{display: 'flex', margin:15}}>
                    <Col style={{flex: 5}}>
                        <Text  style={{fontWeight: 'bold',}}>{TITLE}</Text>
                        <Text>{TEXT}</Text>
                    </Col>
                    <Col style={{flex: 1}}>
                        <Switch 
                            value={this.state.isPreferredCard} 
                            onValueChange={this.onValueChange.bind(this)}/>
                    </Col>
                </Grid>

                <View footer>
                    <Button block primary onPress={(): boolean=>this.props.navigation.navigate(ROUTES.PORTFOLIO_HOME)}>
                        <Text>
                        {I18n.t('saveCard.saveCard')}
                        </Text>
                    </Button>

                    <Button block light style={{backgroundColor:"#5C6F82", marginTop: 5 }} onPress={(): boolean=>this.props.navigation.navigate(ROUTES.PORTFOLIO_HOME)}>
                        <Text style={{color:"white"}}>
                        {I18n.t('saveCard.cancel')}
                        </Text>
                    </Button>
                </View>



            </Container>
        )
    }
}

export default SaveNewCardScreen