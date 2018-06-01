import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { Col, Grid, Row } from "react-native-easy-grid";
import {
          View,
          Text
} from "native-base";

import I18n from "../../i18n";
import variables from '../../theme/variables';

type Props = Readonly<{
          navigation: NavigationScreenProp<NavigationState>;
        }>;

export default class PaymentBannerComponent extends React.Component<Props> {
          public render(): React.ReactNode {
            const NOMEAVVISO = "Tari 2018"
	  	      const IMPORTO = "€ 199,00"
		        const ENTE = "Comune di Gallarate"
            
            return (
              <Grid style={{backgroundColor:variables.brandDarkGray}}>
              <Row style={{paddingLeft: variables.contentPadding, paddingRight: variables.contentPadding}}>
                <Col>
                  <View spacer={true} /> 
                  <Text style={{fontWeight:'bold',color:'#FFFFFF'}}>{NOMEAVVISO}</Text>
                </Col>
                <Col>
                  <View spacer={true} /> 
                  <Text style={{fontWeight:'bold',color:'#FFFFFF',textAlign:'right'}}>{IMPORTO}</Text>
                </Col>
              </Row>
              <Row style={{paddingLeft: variables.contentPadding, paddingRight: variables.contentPadding}}>
                <Col>
                  <Text style={{color:'#FFFFFF'}}>{ENTE}</Text>
                  <View spacer={true} /> 
                </Col>
                <Col>
                  <Text style={{color:'#FFFFFF',textAlign:'right'}} >{I18n.t("portfolio.ConfirmPayment.cancel")}</Text>
                  <View spacer={true}/> 
                </Col>
              </Row>
            </Grid>
            );
          }

}