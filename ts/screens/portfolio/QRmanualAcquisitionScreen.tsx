import * as React from "react";
import {
	Container,
	Content,
	View,
	Body,
	Left,
	Button,
	Icon,
	Text,
	H1,
	Form,
	Item,
	Label,
	Input
} from "native-base";
import AppHeader from "../../components/ui/AppHeader";
import Modal from "../../components/ui/Modal";
import variables from '../../theme/variables';
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { 
	NavigationScreenProp, 
	NavigationState 
} from "react-navigation";
import { Option, none, some } from "fp-ts/lib/Option";


type Props = Readonly<{
	navigation: NavigationScreenProp<NavigationState>;
}>;

type State = Readonly<{
	PaymentCode: Option<string>;
	FiscalCode: Option<string>;
	Amount: Option<string>;
	isTosModalVisible: boolean;
}>;


/**
 * Portfolio QR code manual acquisition
 */

export default class QRmanualAcquisitionScreen extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			PaymentCode: none,
			FiscalCode: none,
			Amount: none,
			isTosModalVisible: false
		}
	}

	private goBack() {
		this.props.navigation.goBack();
	}

	public render(): React.ReactNode {
	 
		return (
			<Container>
				<AppHeader>
					<Left>
						<Button 
							transparent={true} 
							onPress={() => this.goBack()}
						>
							<Icon name="chevron-left" />
						</Button>
					</Left>
					<Body>
						<Text>
							 {I18n.t("portfolio.QRtoPay.manualSectionName")}
						</Text>
					</Body>
				</AppHeader>
				<Content style={{paddingRight:variables.contentPadding, paddingLeft:variables.contentPadding}}>
					<H1>
						{I18n.t("portfolio.QRtoPay.manualSetHeader")}
					</H1>
					<Text>
						{I18n.t("portfolio.QRtoPay.manualInstructions")}
					</Text>
					<Text
						 link={true}
						 onPress={(): void => this.setState({ isTosModalVisible: true })}
					>
						{I18n.t("portfolio.QRtoPay.modalLink")}
					</Text>
					<Form>
						<Item floatingLabel>
             				 	<Label>{I18n.t("portfolio.QRtoPay.noticeCode")}</Label>
              					<Input 
							    keyboardType={"numeric"}
							    onChangeText={(value) => {
								    this.setState({ PaymentCode: some(value)})
							    }}
							/>
           				</Item>
						<Item floatingLabel>
             				 	<Label>{I18n.t("portfolio.QRtoPay.entityCode")}</Label>
              					<Input 
							    keyboardType={"numeric"}
							    onChangeText={(value) => {
								    this.setState({ FiscalCode: some(value)})
							    }}
							/>
           				</Item>
						<Item floatingLabel>
             				 	<Label>{I18n.t("portfolio.QRtoPay.amount")}</Label>
              					<Input 
							    keyboardType={"numeric"}
							    onChangeText={(value) => {
								    this.setState({ Amount: some(value)})
							    }}
							/>
           				</Item>
					</Form>
				</Content>
				<View footer>
				<Button
					block={true}
					primary={true}
					onPress={(): boolean =>
						this.props.navigation.navigate(ROUTES.PORTFOLIO_PAYMENT_SUMMARY)
						}
					>
					<Text>
						{I18n.t("portfolio.QRtoPay.continue")}
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

