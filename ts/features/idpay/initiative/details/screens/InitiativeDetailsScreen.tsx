import { Route, useRoute } from "@react-navigation/core";
import { List, Text, View } from "native-base";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { widthPercentageToDP } from "react-native-responsive-screen";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import TypedI18n from "../../../../../i18n";
import customVariables from "../../../../../theme/variables";
import InitiativeCardComponent from "../components/InitiativeCardComponent";
import EmptyInitiativeSvg from "../../../../../../img/features/idpay/empty_initiative.svg";

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    alignSelf: "center",
    width: widthPercentageToDP(90),
    maxWidth: 343,
    height: 192,
    top: 2
  },
  newInitiativeMessageContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  textCenter: {
    textAlign: "center"
  },
  flexGrow: {
    flexGrow: 1
  }
});

const InitiativeSettings = (bonus: InitiativeDTO) => (
  <>
    <H3>{TypedI18n.t("idpay.wallet.bonusDetailsScreen.yourOperations")}</H3>
    <View spacer xsmall />
    <LabelSmall weight="Regular" color="bluegreyDark">
      {TypedI18n.t("idpay.wallet.bonusDetailsScreen.yourOperationsSubtitle") +
        " "}
      <LabelSmall weight="SemiBold">
        {TypedI18n.t("idpay.wallet.bonusDetailsScreen.yourOperationsLink")}
      </LabelSmall>
    </LabelSmall>
    <View spacer extralarge />
    <H3>{TypedI18n.t("idpay.wallet.bonusDetailsScreen.settings.header")}</H3>
    <View spacer small />
    <List>
      <ListItemComponent
        title={TypedI18n.t(
          "idpay.wallet.bonusDetailsScreen.settings.associatedPaymentMethods"
        )}
        subTitle={`${bonus.nInstr} ${TypedI18n.t(
          "idpay.wallet.bonusDetailsScreen.settings.methodsi18n"
        )}`}
      />
      <ListItemComponent
        title={TypedI18n.t(
          "idpay.wallet.bonusDetailsScreen.settings.selectedIBAN"
        )}
        subTitle={bonus.iban}
      />
    </List>
  </>
);

export type InitiativeDetailsScreenParams = {
  initiativeId: string;
};
type RouteProps = Route<
  "IDPAY_INITIATIVE_DETAILS",
  InitiativeDetailsScreenParams
>;

export const InitiativeDetailsScreen = () => {
  const route = useRoute<RouteProps>();
  const { initiativeId } = route.params;
  const bonus: InitiativeDTO = {
    nInstr: 0,
    endDate: new Date("2021-12-31"),
    initiativeId,
    iban: "IT60X0542811101000000123456",
    status: StatusEnum.NOT_REFUNDABLE,
    accrued: 0,
    amount: 500,
    refunded: 0,
    initiativeName: "18App"
  };

  const initiativeNotConfiguredContent = (
    <View style={[styles.newInitiativeMessageContainer, IOStyles.flex]}>
      <EmptyInitiativeSvg width={130} height={130} />
      <View spacer />
      <H3>Configura l'iniziativa!</H3>
      <View spacer />
      <Text style={styles.textCenter}>
        Aggiungi almeno un metodo per iniziare ad utilizzare 18 app.
      </Text>
    </View>
  );
  const isInitiativeConfigured = bonus.status === StatusEnum.REFUNDABLE;

  return (
    <BaseScreenComponent
      dark={true}
      titleColor={"white"}
      goBack={true}
      headerTitle={bonus.initiativeName}
      headerBackgroundColor={IOColors.bluegrey}
    >
      <FocusAwareStatusBar
        backgroundColor={IOColors.bluegrey}
        barStyle={"light-content"}
      />
      <ScrollView
        style={IOStyles.flex}
        bounces={false}
        contentContainerStyle={styles.flexGrow}
      >
        <LinearGradient colors={[IOColors.bluegrey, IOColors.bluegreyDark]}>
          <View style={[IOStyles.horizontalContentPadding, { height: 149 }]} />
        </LinearGradient>
        <View style={styles.card}>
          <InitiativeCardComponent {...bonus} />
        </View>

        <View
          style={[
            // styles.flexFull,
            IOStyles.flex,
            IOStyles.horizontalContentPadding,
            styles.flexGrow,
            {
              paddingTop: customVariables.contentPadding
            }
          ]}
        >
          <View spacer extralarge />
          <View spacer small />
          {isInitiativeConfigured
            ? InitiativeSettings(bonus)
            : initiativeNotConfiguredContent}
        </View>
      </ScrollView>
      {!isInitiativeConfigured && (
        <>
          <FooterWithButtons
            type="SingleButton"
            leftButton={{
              block: true,
              primary: true,
              title: TypedI18n.t(
                "idpay.wallet.bonusDetailsScreen.startConfigurationCTA"
              )
            }}
          />
          <View spacer />
        </>
      )}
    </BaseScreenComponent>
  );
};
