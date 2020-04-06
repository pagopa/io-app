
import * as React from "react";
import { StyleSheet } from "react-native";
import BaseScreenComponent from '../../../components/screens/BaseScreenComponent';
import FooterWithButtons from '../../../components/ui/FooterWithButtons';
import { Dispatch } from 'redux';
import { navigateToTransactionDetailsScreen } from '../../../store/actions/navigation';
import { Transaction } from '../../../types/pagopa';
import { connect } from 'react-redux';
import { NavigationInjectedProps } from 'react-navigation';
import { Content, View, Text } from 'native-base';
import IconFont from '../../../components/ui/IconFont';
import I18n from 'i18n-js';
import customVariables from '../../../theme/variables';

type NavigationParams = Readonly<{
    transaction: Transaction;
  }>;
  
type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps & ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
    center: {
        alignSelf: 'center'
    }
})

class TransactionSuccessScreen extends React.PureComponent<Props>{
    private transaction = this.props.navigation.getParam('transaction');
    public render(){
        return(
            <BaseScreenComponent>
                <Content>
                    <View spacer={true} extralarge={true}/>
                     <IconFont 
                        name={'io-complete'} 
                        size={120}
                        color={customVariables.brandHighlight}
                        style={styles.center}
                    />
                    <View spacer={true}/>
                    <Text  alignCenter={true}>{`${I18n.t("global.genericThanks")},`}</Text>
                    <Text alignCenter={true} bold={true}>{I18n.t('wallet.ConfirmPayment.transactionSuccess')}</Text>
                </Content>

            <FooterWithButtons 
                type={'SingleButton'}
                leftButton={{
                    title: I18n.t('wallet.receipt2'),
                    primary: true,
                    onPress: () => this.props.navigateToReceipt(this.transaction)
                }}
            />
            
            </BaseScreenComponent>
        )
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    navigateToReceipt: (transaction: Transaction) => dispatch(
        navigateToTransactionDetailsScreen({
          isPaymentCompletedTransaction: true,
          transaction: transaction
        }))
})


export default connect(undefined, mapDispatchToProps)(TransactionSuccessScreen)
