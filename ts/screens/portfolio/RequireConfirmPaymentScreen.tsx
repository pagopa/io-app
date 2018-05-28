import * as React from "react";
import {
	Container,
	Body,
	View,
	Content,
	Left,
	Button,
	Icon,
	Text,
	H1
} from "native-base";

import AppHeader from "../../components/ui/AppHeader";

import I18n from "../../i18n";

import { 
	NavigationScreenProp, 
	NavigationState 
} from "react-navigation";
import { Grid, Row, Col  } from 'react-native-easy-grid';
import variables from '../../theme/variables';
import ROUTES from '../../navigation/routes';
import Modal from "../../components/ui/Modal";

type Props = Readonly<{
	navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
	isTosModalVisible: boolean;
 }>;

/**
 * Portfolio ask to the user about proceed or not with the payment
 */

class RequireConfirmPaymentScreen extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			isTosModalVisible: false
		}
	}

	private goBack() {
		this.props.navigation.goBack();
	}
	
	public render(): React.ReactNode {
		const NOMEAVVISO = "Tari 2018"
		const IMPORTO = "€ 199,00"
		const ENTE = "Comune di Gallarate"
		const FEE = "€ 0,50"
		const TOTALEALL = "€ 199,50"

		return (
			<Container>
				<AppHeader >
					<Left>
						<Button 
							transparent={true} 
							onPress={() => 
								this.goBack()
							}
						>
							<Icon name="chevron-left" />
						</Button>
					</Left>
					<Body>
						<Text>
							 {I18n.t("portfolio.ConfirmPayment.title")}
						</Text>
					</Body>
				</AppHeader>

				<Content>
					<Grid style={{backgroundColor:'#5C6F82'}}>
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
					<View style={{paddingLeft: variables.contentPadding, paddingRight: variables.contentPadding}}>
						<View spacer={true} large={true}/>		
						
						<H1>{I18n.t("portfolio.ConfirmPayment.askConfirm")}</H1>

						<View spacer={true} large={true}/>

						<Text> Credit Card component </Text>

						<View spacer={true} large={true}/>

						<Grid>
							<Row>
								<Col>
									<Text>{I18n.t("portfolio.ConfirmPayment.partialAmount")}</Text>
								</Col>
								<Col>
									<Text style={{fontWeight:'bold', textAlign:'right'}}>{IMPORTO}</Text>
								</Col>
							</Row>
							<Row>
								<Col>
									<Text>{I18n.t("portfolio.ConfirmPayment.fee")}</Text>
									<Text 
										link={true}
										onPress={(): void => 
											this.setState({ isTosModalVisible: true })
										}
									> {I18n.t("portfolio.ConfirmPayment.why")} </Text>
								</Col>
								
								<Col>
									<Text style={{fontWeight:'bold', textAlign:'right'}} >{FEE}</Text>
								</Col>
								
							</Row>
							<View spacer={true} large={true}/>
							<Row style={{borderTopWidth:1}}>
							 
								<Col>
									<View spacer={true} large={true}/>
									<H1> {I18n.t("portfolio.ConfirmPayment.totalAmount")} </H1>
								</Col>
								<Col>
									<View spacer={true} large={true}/> 
									<H1 style={{ textAlign:'right'}}> {TOTALEALL} </H1>
								</Col>
								
							</Row>
							<Row>
								<Col>
									<View spacer={true} large={true}/>
									<Text style={{textAlign:'center'}}> {I18n.t("portfolio.ConfirmPayment.info")} </Text>
									<View spacer={true} extralarge={true}/>
								</Col>
							</Row>
						</Grid>
					</View>
				</Content>

				<View footer>
					<Button
						block={true}
						primary={true}
						onPress={() =>
							this.props.navigation.navigate(ROUTES.PORTFOLIO_RECEIPT)
						}
						>
						<Text>
							{I18n.t("portfolio.QRtoPay.continue")}
						</Text>
					</Button>
					<Button
						block={true}
						light={true}
						onPress={_ => this.goBack()}
						>
						<Text>
							{I18n.t("portfolio.QRtoPay.cancel")}
						</Text>
				</Button>
				</View>

				<Modal isVisible={this.state.isTosModalVisible} fullscreen={true}>
					<View header={true}>
						<Icon
						name="cross"
						onPress={(): void => this.setState({ isTosModalVisible: false })}
						/>
					</View>
					<Content>
						<H1>{I18n.t("personal_data_processing.title")}</H1>
						<View spacer={true} large={true} />
						<Text>{I18n.t("personal_data_processing.content")}</Text>
					</Content>
				</Modal>
			</Container>
		);
	}

}

export default RequireConfirmPaymentScreen