/**
 * This screen allows the user to select the payment method for a selected transaction
 * TODO: integrate credit card component
 *   https://www.pivotaltracker.com/n/projects/2048617/stories/157422715
 */
import {
  Body,
  Button,
  Container,
  Content,
  Left,
  Text,
  View,
  H1
} from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import Icon from "../../theme/font-icons/io-icon-font/index";
import AppHeader from "../../components/ui/AppHeader";
import PaymentBannerComponent from "../../components/wallet/PaymentBannerComponent";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import { TransactionSummary } from '../../types/wallet';
import { WalletAPI } from '../../api/wallet/wallet-api';

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

const transaction: Readonly<TransactionSummary> = WalletAPI.getTransactionSummary();

export class ChoosePaymentMethodScreen extends React.Component<
  Props,
  never
> {
  private goBack() {
    this.props.navigation.goBack();
  }

  public render(): React.ReactNode {	
	return (
    	<Container>
        	<AppHeader>
        		<Left>
            		<Button transparent={true} onPress={() => this.goBack()}>
              			<Icon name="io-back" size={variables.iconSize1} />
            		</Button>
        		</Left>
        		<Body>
            		<Text>{I18n.t("wallet.payWith.header")}</Text>
          		</Body>
        	</AppHeader>
        	<Content original={true}>
						<PaymentBannerComponent 
							navigation={this.props.navigation} 
							paymentReason={transaction.paymentReason}
							currentAmount={transaction.currentAmount.toString()}
							entity={transaction.entityName}
						/>
						<View spacer={true}/>
						<H1> {I18n.t("wallet.payWith.title")} </H1>
						<View spacer={true}/>
						<Text> {I18n.t("wallet.payWith.info")}</Text>
						<View spacer={true}/>
						<Text> CREDIT CARD COMPONENT </Text>
        	</Content>
      	</Container>
	)}
}
