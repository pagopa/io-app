import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import {
  Alert,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import {
  IOColors,
  VSpacer,
  IOSpacingScale,
  ListItemAction,
  useIOToast
} from "@pagopa/io-app-design-system";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../../components/ui/FocusAwareStatusBar";
import I18n from "../../../i18n";
import { deleteWalletRequest } from "../../../store/actions/wallet/wallets";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { getWalletsById } from "../../../store/reducers/wallet/wallets";
import { PaymentMethod } from "../../../types/pagopa";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { isDesignSystemEnabledSelector } from "../../../store/reducers/persistedPreferences";

type Props = {
  paymentMethod: PaymentMethod;
  card: React.ReactNode;
  content: React.ReactNode;
  headerTitle?: string;
};

// ----------------------------- component -----------------------------------

/**
 * Base layout for payment methods screen & legacy delete handling
 */
const BasePaymentMethodScreen = (props: Props) => {
  const { card, content, paymentMethod } = props;
  const hasErrorDelete = pot.isError(useIOSelector(getWalletsById));
  const [isLoadingDelete, setIsLoadingDelete] = React.useState(false);
  const dispatch = useIODispatch();
  const isDSenabled = useIOSelector(isDesignSystemEnabledSelector);
  const blueHeaderColor = isDSenabled ? IOColors["blueIO-600"] : IOColors.blue;

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

  React.useEffect(() => {
    if (hasErrorDelete) {
      setIsLoadingDelete(false);
    }
  }, [hasErrorDelete]);

  const onDeleteMethod = () => {
    // Create a native Alert to confirm or cancel the delete action
    Alert.alert(
      I18n.t("wallet.newRemove.title"),
      I18n.t("wallet.newRemove.body"),
      [
        {
          text:
            Platform.OS === "ios"
              ? I18n.t(`wallet.delete.ios.confirm`)
              : I18n.t(`wallet.delete.android.confirm`),
          style: "destructive",
          onPress: () => {
            deleteWallet(paymentMethod.idWallet);
          }
        },
        {
          text: I18n.t("global.buttons.cancel"),
          style: "default"
        }
      ],
      { cancelable: false }
    );
  };

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
      headerTitle={props.headerTitle ?? ""}
      faqCategories={["wallet_methods"]}
      goBack={true}
      titleColor="white"
      dark={true}
      headerBackgroundColor={blueHeaderColor}
    >
      <FocusAwareStatusBar
        backgroundColor={blueHeaderColor}
        barStyle="light-content"
      />
      <ScrollView>
        <View style={[styles.blueHeader, { backgroundColor: blueHeaderColor }]}>
          <View style={styles.cardContainer}>{card}</View>
        </View>
        <VSpacer size={24} />
        <View style={IOStyles.horizontalContentPadding}>
          {content}
          <VSpacer size={24} />
          <DeleteButton onPress={onDeleteMethod} />
        </View>
        <VSpacer size={40} />
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

// ----------------------------- styles -----------------------------------

const cardContainerHorizontalSpacing: IOSpacingScale = 16;

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: cardContainerHorizontalSpacing,
    alignItems: "center",
    marginBottom: "-15%",
    aspectRatio: 1.7,
    width: "100%"
  },
  blueHeader: {
    paddingTop: "75%",
    marginTop: "-75%",
    marginBottom: "15%"
  }
});

export default BasePaymentMethodScreen;
