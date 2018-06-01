import * as React from "react";
import { 
	Container,
	Icon,
	Left,
	Body,
	Text,
	Button,
	Content,
	H1,
	View,
	Input
} from "native-base";
import {
	Grid,
	Col 
} from "react-native-easy-grid";
import { 
	NavigationScreenProp, 
	NavigationState 
} from "react-navigation";
import { StyleSheet } from 'react-native';
import AppHeader from "../../components/ui/AppHeader";
import I18n from "../../i18n";
import ROUTES from '../../navigation/routes';
import variables from '../../theme/variables';
import PaymentBannerComponent from "../../components/portfolio/PaymentBannerComponent";

type Props = Readonly<{
	navigation: NavigationScreenProp<NavigationState>;
}>;
 
/**
 *  Portfolio ask for the code sent by sms
 */

class VerifyTransactionCodeScreen extends React.Component<Props, never> {
	constructor(props: Props) {
		super(props);
	}

	private goBack() {
		this.props.navigation.goBack();
	}

	public render(): React.ReactNode {
		return(
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
						{I18n.t("portfolio.sms.code")}
					</Text>
				</Body>
			</AppHeader>

			<Content original={true}>
				<PaymentBannerComponent navigation={this.props.navigation}/>
				<View style={styles.contentPadding}>	
					<View 
						spacer={true} 
						large={true}
					/>
					<H1>
						{I18n.t("portfolio.sms.title")}
					</H1>
					<View spacer={true} large={true}/>

					<Grid>
						<Col>
							<Text style={{fontWeight:'bold'}}> 
								{I18n.t("portfolio.sms.code")} 
							</Text>
						</Col>
						<Col>
							<Text 
								link={true} 
								bold={true}
								style={{textAlign:'right'}}
							> 
								{I18n.t("portfolio.sms.newCode")}
							</Text>
						</Col>
					</Grid>
					<View spacer={true}/>
					<Input 
						style={{ borderBottomWidth: 1}} 
						keyboardType={'numeric'}  
					/>
					<View spacer={true}/>
					<Text> 
						{I18n.t("portfolio.sms.info")}
					</Text>
				</View>
			</Content>
			
			<View footer={true}>
				<Button
					block={true}
					primary={true}
					onPress={(): boolean =>
						this.props.navigation.navigate(ROUTES.PORTFOLIO_RECEIPT)
					}
				>
					<Text>
						{I18n.t("portfolio.sms.continue")}
					</Text>
				</Button>
				<Button
					block={true}
					light={true}
					onPress={() => this.goBack()}
					>
					<Text>
						{I18n.t("portfolio.sms.cancel")}
					</Text>
				</Button>	
			</View>

		</Container>	
		);
	}
}

export default VerifyTransactionCodeScreen;

const styles = StyleSheet.create({ 
	contentPadding: {
		paddingRight:variables.contentPadding, 
		paddingLeft:variables.contentPadding
	}
})