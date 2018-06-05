import * as React from "react";
import {
	Container,
	Left,
	Right,
	Button,
	Icon,
	Body,
	Text,
	Content,
	H1,
	View,
	List,
	ListItem
} from "native-base";
import { 
	FlatList, 
	Image,
	StyleSheet,  
	ScrollView
} from "react-native";
import { 
	Grid, 
	Col,
	Row 
} from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import variables from "../../theme/variables";
import AppHeader from '../../components/ui/AppHeader';
import I18n from "../../i18n";

type Props = Readonly<{
    navigation: NavigationScreenProp<NavigationState>;
 }>;

 interface IPaymentManager {
	maxFee: string;
	icon: any;
  }

 const FEE: string = "1€";
 const FEE2: string = "1,30€";

 const paymentManagers: ReadonlyArray<IPaymentManager> = [
	{
	  maxFee: FEE ,
	  icon: require('../../../img/wallet/Managers/Poste_Italiane1x.png')
	},
	{
	  maxFee: FEE2,
	  icon: require('../../../img/wallet/Managers/Unicredit1x.png')
	},
	{
	  maxFee: FEE,
	  icon: require('../../../img/wallet/Managers/Nexi1x.png')
	}
  ];

 /**
 * Selection of a payment manager for a card
 */
export class AddManagerToCardScreen extends React.Component<Props, never> {
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
								this.goBack()}
							>
							<Icon name="chevron-left" />
						</Button>
					</Left>
					<Body>
						<Text>
							 {I18n.t("saveCard.saveCard")}
						</Text>
					</Body>
				</AppHeader>
				<Content>
					<H1>
						{I18n.t("wallet.AddManager.title")}
					</H1>
					<View spacer={true}/>
					<Text>
						{I18n.t("wallet.AddManager.info")}
						<Text>  </Text>
						<Text bold={true}>
							{I18n.t("wallet.AddManager.infobold")}
						</Text>
						<Text>  </Text>
						<Text>
							{I18n.t("wallet.AddManager.info2")}
						</Text>
						<Text>  </Text>
						<Text link={true}>
							{I18n.t("wallet.AddManager.link")}
						</Text>
					</Text>
					<View spacer={true}/>
						<FlatList
							ItemSeparatorComponent={ () => 
								<View style={ { borderBottomWidth:1, borderBottomColor: variables.brandGray } } /> 
							}
							removeClippedSubviews={false}
							numColumns={1}
							data={paymentManagers}
							keyExtractor={item => item.name}
							renderItem={ ({item}) => (
								<View style={style.listItem}>
									<Grid> 
										<Col size={6}  >
											<View spacer={true}/>
											<Row >
												<Image
													style={{
														flexDirection: 'row',
														justifyContent: 'flex-start'	
													}}
													resizeMode={"contain"}
													source={item.icon}
												/>
											</Row>
											<Row>
												<Text style={style.feetext}> 
													{ I18n.t("wallet.AddManager.maxFee") }
													<Text>
														{" "}
													</Text>
													<Text bold={true} style={style.feetext} >
														{item.maxFee}
													</Text> 
												</Text>
											</Row>
											<View spacer={true}/>
										</Col>
										<Col size={1} style={style.icon}>
												<Icon name="chevron-right" />
										</Col>
									</Grid>
								</View>)}
						/>
				</Content>
			</Container>
		);
	}
}

const style = StyleSheet.create({
	
	listItem: {
    	marginLeft: 0,
    	flex: 1,
    	paddingRight: 0
  	},

  	icon: {
	  flexDirection:'row', 
	  alignItems:'center'
	},

	feetext: {
		color: variables.brandDarkGray,
		fontSize: variables.fontSize2
	}

})