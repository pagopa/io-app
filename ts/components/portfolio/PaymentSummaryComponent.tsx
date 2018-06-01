import * as React from "react";
import { 
	NavigationScreenProp, 
	NavigationState 
} from "react-navigation";
import { 
	Col, 
	Grid, 
	Row 
} from "react-native-easy-grid";
import {
          View,
		  Text,
		  Right,
		  H3,
		  H1,
		  Icon
} from "native-base";
import { StyleSheet } from 'react-native';
import I18n from "../../i18n";
import variables from '../../theme/variables';

type Props = Readonly<{
		  navigation: NavigationScreenProp<NavigationState>;
		  amount: string;
		  expireDate: string;
		  tranche: string;
}>;

export default class PaymentSummaryComponent extends React.Component<Props>{
	public render(): React.ReactNode {
		return(
			<Grid style={styles.darkContentPadding}>
								<View spacer={true} large={true}/>
								<Row>
										<H3 style={styles.white}>
											{I18n.t("portfolio.QRtoPay.amount")}
										</H3>
										<Right>
											<H1 style={styles.white}>
												{this.props.amount}
											</H1>
										</Right>
								</Row>
								<View spacer={true} />
								<Row>
										<H3  style={styles.white}>
											{I18n.t("portfolio.QRtoPay.expireDate")}
										</H3>
										<Right>
											<H1  style={styles.white}>
												{this.props.expireDate}
											</H1>
										</Right>
								</Row>
								<View spacer={true} />
								<Row>
										<H3  style={styles.white}>
											{I18n.t("portfolio.QRtoPay.tranche")}
										</H3>
										<Right>
											<H1  style={styles.white}>
												{this.props.tranche}
											</H1>
										</Right>
								</Row>
								<View spacer={true} large={true}/>	
							</Grid>
		);
	}
}
		

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
	}
})




							