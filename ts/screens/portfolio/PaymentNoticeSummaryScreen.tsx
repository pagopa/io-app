import * as React from "react";
import {
	Container,
	Content,
	Body,
	View,
	Left,
	Right,
	Button,
    Icon,
	H1,
	H3,
	Text
} from "native-base";
import  { Image } from "react-native";
import {
	Grid, 
	Row 
} from "react-native-easy-grid";
import { StyleSheet } from 'react-native';
import AppHeader from "../../components/ui/AppHeader";
import variables from "../../theme/variables";
import I18n from "../../i18n";
import { 
	NavigationScreenProp, 
	NavigationState 
} from "react-navigation";
import ROUTES from '../../navigation/routes';
import Modal from "../../components/ui/Modal";
import UpdatedPaymentSummaryComponent from "../../components/portfolio/UpdatedPaymentSummaryComponent";
import PaymentSummaryComponent from "../../components/portfolio/PaymentSummaryComponent";


type Props = Readonly<{
	navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
	isModalVisible: boolean;
	isAmountUpdated: boolean;
	amount: string,
	updatedAmount: string;
	expireDate: string;
	tranche: string;
 }>;

/**
 * Portfolio acquired payment notice summary
 */
class PaymentNoticeSummaryScreen extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			isModalVisible: false,
			isAmountUpdated: false,
			amount: "€ 199,00",
			updatedAmount: "€ 215,00",
			expireDate: "31/01/2018",
			tranche: "unica"
		}	
	}

	private goBack() {
		this.props.navigation.goBack();
	}
	
	private getSummary(){
		if (this.state.isAmountUpdated == true) {
			return (
				<UpdatedPaymentSummaryComponent 
					navigation={this.props.navigation}
					amount={this.state.amount}
					updatedAmount={this.state.updatedAmount}
		  			expireDate={this.state.expireDate}
					tranche={this.state.tranche}
				/>
			)	
		} else {
			return (
				<PaymentSummaryComponent 
					navigation={this.props.navigation}
					amount={this.state.amount}
		  			expireDate={this.state.expireDate}
					tranche={this.state.tranche}
				/>
			)
		}
	}

	public render(): React.ReactNode {
		const NOMEAVVISO: string = "Tari 2018"
		const NOMEENTE: string = "Comune di Gallarate - Settore Tributi"
		const INDIRIZZOENTE: string = "Via Cavour n.2 - Palazzo Broletto,21013"
		const CITTAENTE: string = "Gallarate (VA)"
		const TELENTE: string = "0331.754224"
		const WEBPAGEENTE: string = "www.comune.gallarate.va.it"
		const EMAILENTE: string = "tributi@coumne.gallarate.va.it"
		const PECENTE: string = "protocollo@pec.comune.gallarate.va.it"
		const DESTINATARIO: string = "Mario Rossi"
		const INDIRIZZODESTINATARIO: string = "Via Murillo 8, 20149 Milano (MI)"
		const CBILL: string = "A0EDT"
		const IUV: string = "1 1111 6000 0015 80"
		const CODICEENTE: string = "01 19 9250 158"

		return (
			<Container>
				<AppHeader>
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
							 {I18n.t("portfolio.QRtoPay.proceedSectionName")}
						</Text>
					</Body>
				</AppHeader>

				<Content original={true}>
					<Grid style={{
						paddingRight:variables.contentPadding, 
						paddingLeft:variables.contentPadding
						}}
					>
						<Row>
							<Left>
								<H3>
									{I18n.t("portfolio.QRtoPay.paymentNotice")}
								</H3>
								<H1>
									{NOMEAVVISO}
								</H1>
							</Left>
							<Right>
								<Image source={require('../../../img/wallet/icon-avviso-pagopa.png')}/>
							</Right>
						</Row>
						<View 
							spacer={true} 
							large={true} 
						/>
					</Grid>
					{this.getSummary()}
					<View 
						spacer={true} 
						large={true}
					/>
					<Grid style={styles.contentPadding}>
						<Row>
							<Text bold={true}>
								{I18n.t("portfolio.QRtoPay.entity")}
							</Text>
						</Row>
						<Row>
							<Text>
								{NOMEENTE}
							</Text>
						</Row>
						<Row>
							<Text >
								{INDIRIZZOENTE}
							</Text>
						</Row>
						<Row>
							<Text>
								{CITTAENTE}
							</Text>
						</Row>
						<Row>
							<Text>
								{I18n.t("portfolio.QRtoPay.info")}
							</Text>
						</Row>
						<Row>
							<Text>
								{I18n.t("portfolio.QRtoPay.tel")}
							</Text>
							<Text link={true}>
								{TELENTE}
							</Text>
						</Row>
						<Row>
							<Text link={true}>
								{WEBPAGEENTE}
							</Text>
						</Row>
						<Row>
							<Text>
								{I18n.t("portfolio.QRtoPay.email")}
							</Text>
							<Text link={true}>
								{EMAILENTE}
							</Text>
						</Row>
						<Row>
							<Text>
								{I18n.t("portfolio.QRtoPay.PEC")}
							</Text>
							<Text link={true}>
								{PECENTE}
							</Text>
						</Row>
						<View 
							spacer={true} 
							large={true}
						/>
						<Row>
							<Text bold={true}>
								{I18n.t("portfolio.QRtoPay.recipient")}
							</Text>
						</Row>
						<Row>
							<Text>
								{DESTINATARIO}
							</Text>
						</Row>
						<Row>
							<Text>
								{INDIRIZZODESTINATARIO}
							</Text>
						</Row>
						<View 
							spacer={true} 
							large={true}
						/>
						<Row>
							<Text bold={true}>
								{I18n.t("portfolio.QRtoPay.object")}
							</Text>
						</Row>
						<Row>
							<Text>
								{NOMEAVVISO}
							</Text>
						</Row>
						<View 
							spacer={true} 
							large={true}
						/>
						<Row>
							<Text bold={true}>
								{I18n.t("portfolio.QRtoPay.cbillCode")}
							</Text>
							<Text bold={true}>
								{CBILL}
							</Text>
						</Row>
						<Row>
							<Text bold={true}>
								{I18n.t("portfolio.QRtoPay.iuv")}
							</Text>
							<Text bold={true}>
								{IUV}
							</Text>
						</Row>
						<Row>
							<Text bold={true}>
								{I18n.t("portfolio.QRtoPay.entityCode2")}
							</Text>
							<Text bold={true}>
								{CODICEENTE}
							</Text>
						</Row>
						<View 
							spacer={true} 
							extralarge={true}
						/>
					</Grid>
				</Content>
				<View footer>
					<Button
						block={true}
						primary={true}
						onPress={()=>
							this.props.navigation.navigate(ROUTES.PORTFOLIO_ASK_CONFIRM_PAYMENT)
						}
						>
						<Text>
							{I18n.t("portfolio.QRtoPay.continue")}
						</Text>
					</Button>
					<Button
						block={true}
						light={true}
						onPress={(): void => 
							this.goBack()
						}
						>
						<Text>
							{I18n.t("portfolio.QRtoPay.cancel")}
						</Text>
					</Button>
				</View>

				<Modal 
					isVisible={this.state.isModalVisible} 
					fullscreen={true}
				>
					<View header={true}>
						<Icon
						name="cross"
						onPress={(): void => 
							this.setState({ isModalVisible: false })
						}
						/>
					</View>
					<Content>
						<H1>
							{I18n.t("personal_data_processing.title")}
						</H1>
						<View 
							spacer={true} 
							large={true} 
						/>
						<Text>	
							{I18n.t("personal_data_processing.content")}
						</Text>
					</Content>
				</Modal>
			</Container>
		);
	}

}

export default PaymentNoticeSummaryScreen

const styles = StyleSheet.create({ 
	contentPadding: {
		paddingRight:variables.contentPadding, 
		paddingLeft:variables.contentPadding
	},

	darkContentPadding: {
		backgroundColor: variables.brandDarkGray,
		paddingRight:variables.contentPadding, 
		paddingLeft:variables.contentPadding
	},

	white: {
		color: variables.brandLight,
		
	},

	whiteStrike: {
		fontSize: variables.fontSizeBase * 1.25,
		color: variables.brandLight,
		textDecorationLine: 'line-through', 
		textDecorationStyle: 'solid'
	},

	toAlignCenter: {
		flexDirection:'row', 
		alignItems: 'baseline'
	},

	toAlignColumnstart: {
		flexDirection:'column', 
		alignItems: 'flex-start'
	},

	underlined: {
		textDecorationLine: 'underline',
		color: variables.brandLight,
	}

})