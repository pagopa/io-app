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
import {
	Grid, 
	Row 
} from "react-native-easy-grid";
import AppHeader from "../../components/ui/AppHeader";
import variables from "../../theme/variables";
import I18n from "../../i18n";
//import ROUTES from "../../navigation/routes";
import { 
	NavigationScreenProp, 
	NavigationState 
} from "react-navigation";
import ROUTES from '../../navigation/routes';

type Props = Readonly<{
	navigation: NavigationScreenProp<NavigationState>;
}>;

/**
 * Portfolio acquired payment notice summary
 */

class PaymentNoticeSummaryScreen extends React.Component<Props, never> {
	constructor(props: Props) {
		super(props);	
	}

	private goBack() {
		this.props.navigation.goBack();
	}
	
	public render(): React.ReactNode {
		const NOMEAVVISO: string = "Tari 2018"
		const IMPORTO: string = "€ 199,00"
		const SCADENZA: string = "31/01/2018"
		const RATA: string = "unica"
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

				<Content>
					<Grid style={{paddingRight:variables.contentPadding, paddingLeft:variables.contentPadding}}>
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
								<Icon name="list"/>
							</Right>
						</Row>
						<View 
							spacer={true} 
							large={true} 
						/>
					</Grid>
					<Grid style={{backgroundColor: variables.brandGray}}>
								<View 
									spacer={true} 
									large={true} 
								/>
								<Row style={{paddingRight:variables.contentPadding, paddingLeft:variables.contentPadding}}>
										<H3>
											{I18n.t("portfolio.QRtoPay.amount")}
										</H3>
										<Right>
											<H1>
												{IMPORTO}
											</H1>
										</Right>
								</Row>
								<Row style={{paddingRight:variables.contentPadding, paddingLeft:variables.contentPadding}}>
										<H3>
											{I18n.t("portfolio.QRtoPay.expireDate")}
										</H3>
										<Right>
											<H1>
												{SCADENZA}
											</H1>
										</Right>
								</Row>
								<Row style={{paddingRight:variables.contentPadding, paddingLeft:variables.contentPadding}}>
										<H3>
											{I18n.t("portfolio.QRtoPay.tranche")}
										</H3>
										<Right>
											<H1>
												{RATA}
											</H1>
										</Right>
								</Row>	
					</Grid>
					<View 
						spacer={true} 
						large={true}
					/>
					<Grid style={{paddingRight:variables.contentPadding, paddingLeft:variables.contentPadding}}>
						<Row>
							<Text>
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
							<Text>
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
							<Text>
								{I18n.t("portfolio.QRtoPay.object")}
							</Text>
							<Text>
								{NOMEAVVISO}
							</Text>
						</Row>
						<Row>
							<Text>
								{I18n.t("portfolio.QRtoPay.cbillCode")}
							</Text>
							<Text>
								{CBILL}
							</Text>
						</Row>
						<Row>
							<Text>
								{I18n.t("portfolio.QRtoPay.iuv")}
							</Text>
							<Text>
								{IUV}
							</Text>
						</Row>
						<Row>
							<Text>
								{I18n.t("portfolio.QRtoPay.entityCode2")}
							</Text>
							<Text>
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
					onPress={() => this.goBack()}
					>
					<Text>
						{I18n.t("portfolio.QRtoPay.cancel")}
					</Text>
				</Button>
				</View>
			</Container>
		);
	}

}

export default PaymentNoticeSummaryScreen