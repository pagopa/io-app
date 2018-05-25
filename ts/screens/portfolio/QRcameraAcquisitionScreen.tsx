import * as React from "react";
import{
	Container,
	Body,
	Left,
	Button,
	Icon,
	Text,
	View,
	Grid,
	Row,
	Col
} from "native-base";
import AppHeader from "../../components/ui/AppHeader";
import QRCodeScanner from 'react-native-qrcode-scanner'; 

import {Dimensions, StyleSheet} from 'react-native';

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
export default class QRcameraAcquisitionScreen extends React.Component<Props, never> {
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
				<Container>
					<QRCodeScanner
						containerStyle={styles.container}
						showMarker={true}
						cameraStyle={styles.camera}
						customMarker={
							<View style={styles.rectangleContainer}>
									<View style={styles.rectangle}>
										<Grid>
											<Row>
												<Col>
												<View style={styles.rectangleTL}/>
												</Col>
												<Col>
												<View style={styles.rectangleTR}/>
												</Col>
											</Row>
											<Row>
												<Col>
													<View style={styles.rectangleBL}/>
												</Col>
												<Col>
												<View style={styles.rectangleBR}/>
												</Col>
											</Row>
										</Grid>
									</View>
          				</View>
						}
					>
					</QRCodeScanner>
					<View>
						<View spacer={true} large={true}/>
						<Text style={{textAlign:'center'}}>
								{I18n.t("portfolio.QRtoPay.instructions")}
						</Text>
						<View spacer={true} extralarge={true}/>
					</View>	
				</Container>
				<View footer={true}>
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
							{I18n.t("portfolio.QRtoPay.cancel")}
						</Text>
					</Button>
				</View>
			</Container>
		);
	}
}


const screenwidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "flex-start",
		justifyContent: "center",
		backgroundColor: "transparent"
	 },
	camera: {
		flex: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		height: screenwidth*4/3,
		width: screenwidth,
	 },
  
	 rectangleContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		
		borderColor: 'rgba(56,56,56,0.5)',
		//borderWidth: screenwidth/4,
	 },

	 outRectangle: {
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: screenwidth/2,
		borderColor: 'rgba(56,56,56,0.5)',
		
	 },
	 rectangle: {
		height: screenwidth/2,
		width: screenwidth/2,
		borderWidth: 0,
		borderColor: 'transparent',
		backgroundColor: 'transparent',
	 },

	 rectangleTR: {
		height: screenwidth/6,
		width: screenwidth/6,
		borderTopWidth: 2,
		borderRightWidth: 2,
		borderColor: '#FFFFFF',
		backgroundColor: 'transparent',
		position:'absolute',
		top:0,
		right:0
	 },

	 rectangleTL: {
		height: screenwidth/6,
		width: screenwidth/6,
		borderTopWidth: 2,
		borderLeftWidth: 2,
		borderColor: '#FFFFFF',
		backgroundColor: 'transparent',
		position:'absolute',
		top:0,
		left:0
	 },

	 rectangleBL: {
		height: screenwidth/6,
		width: screenwidth/6,
		borderBottomWidth: 2,
		borderLeftWidth: 2,
		borderColor: '#FFFFFF',
		backgroundColor: 'transparent',
		position:'absolute',
		bottom:0,
		left:0
	 },

	 rectangleBR: {
		height: screenwidth/6,
		width: screenwidth/6,
		borderBottomWidth: 2,
		borderRightWidth: 2,
		borderColor: '#FFFFFF',
		backgroundColor: 'transparent',
		position:'absolute',
		bottom:0,
		right:0
	 },

})
