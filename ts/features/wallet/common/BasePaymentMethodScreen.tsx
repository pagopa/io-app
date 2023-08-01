import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { useIOToast } from "../../../components/Toast";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { IOColors } from "../../../components/core/variables/IOColors";
import {
  IOStyles,
  IOVisualCostants
} from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import ListItemAction from "../../../components/ui/ListItemAction";
import I18n from "../../../i18n";
import { deleteWalletRequest } from "../../../store/actions/wallet/wallets";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { getWalletsById } from "../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../types/pagopa";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { useRemovePaymentMethodBottomSheet } from "../component/RemovePaymentMethod";

type Props = {
  paymentMethod: PaymentMethod;
  card: React.ReactNode;
  content: React.ReactNode;
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 207,
    width: "100%",
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    position: "absolute",
    bottom: -50,
    alignItems: "center"
  },
  blueHeader: {
    marginBottom: IOVisualCostants.appMarginDefault,
    marginTop: -300,
    height: 470,
    backgroundColor: IOColors["blueIO-600"],
    top: 0
  }
});

const DeleteButton = ({
  onPress
}: {
  onPress: (event: GestureResponderEvent) => void;
}) => (
  <ListItemAction
    label={I18n.t("cardComponent.removeCta")}
    onPress={onPress}
    accessibilityLabel={I18n.t("cardComponent.removeCta")}
    icon="trashcan"
    variant="danger"
  />
);
/**
 * Base layout for payment methods screen & legacy delete handling
 * @constructor
 */
const BasePaymentMethodScreen = (props: Props) => {
  const { card, content, paymentMethod } = props;
  const hasErrorDelete = pot.isError(useIOSelector(getWalletsById));
  const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);
  const dispatch = useIODispatch();

  const navigation = useNavigation();
  const toast = useIOToast();

  const deleteWallet = (walletId: number) =>
    dispatch(
      deleteWalletRequest({
        walletId,
        onSuccess: _ => {
          toast.success(I18n.t("wallet.delete.successful"));
          navigation.goBack();
        },
        onFailure: _ => {
          toast.error(I18n.t("wallet.delete.failed"));
        }
      })
    );

  const { present, removePaymentMethodBottomSheet } =
    useRemovePaymentMethodBottomSheet(
      {
        icon: paymentMethod.icon,
        caption: paymentMethod.caption
      },
      () => {
        deleteWallet(paymentMethod.idWallet);
        setIsLoadingDelete(true);
      }
    );

  React.useEffect(() => {
    if (hasErrorDelete) {
      setIsLoadingDelete(false);
    }
  }, [hasErrorDelete]);

  if (isLoadingDelete) {
    return (
      <LoadingSpinnerOverlay
        isLoading={true}
        loadingCaption={I18n.t("cardComponent.deleteLoading")}
      />
    );
  }

  return (
    <BaseScreenComponent
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.creditCard.details.header")}
      faqCategories={["wallet_methods"]}
      goBack={true}
      titleColor="white"
      dark={true}
      headerBackgroundColor={IOColors["blueIO-600"]}
    >
      <FocusAwareStatusBar barStyle="light-content" />
      <ScrollView>
        <View style={styles.blueHeader}>
          <View style={styles.cardContainer}>{card}</View>
        </View>

        <VSpacer size={40} />
        <View style={IOStyles.horizontalContentPadding}>
          <VSpacer size={16} />
          {content}
          <VSpacer size={24} />
          <DeleteButton onPress={present} />
        </View>
        <VSpacer size={40} />
        {removePaymentMethodBottomSheet}
      </ScrollView>
    </BaseScreenComponent>
  );
};

export default BasePaymentMethodScreen;
