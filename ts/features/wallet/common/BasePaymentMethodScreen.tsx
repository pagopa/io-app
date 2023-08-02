import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { widthPercentageToDP } from "react-native-responsive-screen";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { useIOToast } from "../../../components/Toast";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOSpacingScale } from "../../../components/core/variables/IOSpacing";
import { IOStyles } from "../../../components/core/variables/IOStyles";
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

// ----------------------- card layout calculations -----------------------

// base consts
const CARD_WIDTH = widthPercentageToDP(100);
const CARD_HEIGHT = 0.5 * CARD_WIDTH;

// the amount of header to render in case of scrollDown
const absoluteMarginTopHeight = 2 * CARD_HEIGHT;

// "progressbar-like" percentage of card that has a
// blue BG, can be played around with
const percentageOfCardWithBackground = 75;

// the actual height of the visible (without scrolling) card's background
const cardBackgroundHeight =
  (percentageOfCardWithBackground / 100) * CARD_HEIGHT;

// how much the card overflows under the header, used as absolute positioning
// and as bottom spacer
const cardOverflowAmount = (100 - percentageOfCardWithBackground) * 2;

// the header's actual height, including the overflow that can only be seen
// when scrolling downwards
const headerHeight = absoluteMarginTopHeight + cardBackgroundHeight;

// ----------------------------- styles -----------------------------------

const styles = StyleSheet.create({
  cardContainer: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    paddingHorizontal: IOSpacingScale[4],
    position: "absolute",
    bottom: -cardOverflowAmount,
    alignItems: "center"
  },
  blueHeader: {
    marginBottom: cardOverflowAmount,
    marginTop: -absoluteMarginTopHeight,
    height: headerHeight,
    backgroundColor: IOColors["blueIO-600"],
    top: 0
  }
});

// ----------------------------- component -----------------------------------

/**
 * Base layout for payment methods screen & legacy delete handling
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
        <VSpacer size={24} />
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

// ----------------------------- utils & export -----------------------------------

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

export default BasePaymentMethodScreen;
