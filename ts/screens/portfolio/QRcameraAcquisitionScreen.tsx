import * as React from "react";
import{
	Container,
	Content,
	Body,
	Left,
	Button,
	Icon,
	Text,
	View
} from "native-base";
import AppHeader from "../../components/ui/AppHeader";


import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

import { 
	NavigationScreenProp, 
	NavigationState 
} from "react-navigation";

type OwnProps = Readonly<{
      navigation: NavigationScreenProp<NavigationState>;
			}>;
			
type ScreenProps = {};

type Props = ScreenProps & OwnProps;

/**
 * Portfolio QR code acquisition by camera
 */
export class QRcameraAcquisitionSreen extends React.Component<Props, never> {
	constructor(props: Props) {
		super(props);
	}

	private goBack() {
		this.props.navigation.goBack();
	}

	public render(): React.ReactNode {
	 
		return (
			<Container>
				<AppHeader>
					<Left>
						<Button transparent={true} onPress={() => this.goBack()}>
							<Icon name="chevron-left" />
						</Button>
					</Left>
					<Body>
						<Text>
							 {I18n.t("portfolio.QRtoPay.cameraSectionName")}
						</Text>
					</Body>
				</AppHeader>
				<Content>
					<Text>
						QR code
					</Text>
					<Text>
						{I18n.t("portfolio.QRtoPay.instructions")}
					</Text>
				</Content>
				<View footer>
					<Button
						block={true}
						primary={true}
						onPress={(): boolean =>
							this.props.navigation.navigate(ROUTES.PORTFOLIO_INSERT_QRCODE_DATA)
							}
						>
						<Text>
							{I18n.t("portfolio.QRtoPay.setDataManually")}
						</Text>
					</Button>
					<Button
						block={true}
						light={true}
						onPress={() => this.goBack()}
						>
						<Text>
							{I18n.t("portfolio.cancel")}
						</Text>
					</Button>
				</View>
			</Container>
		);
	}
	

}
