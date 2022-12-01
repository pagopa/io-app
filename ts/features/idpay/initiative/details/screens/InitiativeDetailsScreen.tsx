import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useNavigation, useRoute } from "@react-navigation/core";
import { List, ListItem, Text, View } from "native-base";
import React, { useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { widthPercentageToDP } from "react-native-responsive-screen";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import EmptyInitiativeSvg from "../../../../../../img/features/idpay/empty_initiative.svg";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import customVariables from "../../../../../theme/variables";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";
import InitiativeCardComponent from "../components/InitiativeCardComponent";
import { idpayInitiativeDetailsSelector, idpayInitiativeGet } from "../store";

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
  alignCenter: {
    alignItems: "center"
  },
  textCenter: {
    textAlign: "center"
  },
  flexGrow: {
    flexGrow: 1
  },
  listItem: {
    flex: 1,
    justifyContent: "space-between"
  }
});

const CustomListItem = ({ transaction }: { transaction: unknown }) => (
  <ListItem style={styles.listItem}>
    <View style={[IOStyles.flex, IOStyles.row, styles.alignCenter]}>
      <Text>LOGO</Text>
      <View hspacer />
      <View style={IOStyles.flex}>
        <H4>Pagamento Pos</H4>
        <LabelSmall weight="Regular" color="bluegrey">
          27 apr 2022
        </LabelSmall>
      </View>
    </View>
    <H4> - {transaction}2,45$</H4>
  </ListItem>
);

const TransactionsList = (timeline: TimelineDTO["operationList"]) => (
  <List>
    {timeline.map((item, index) => (
      <CustomListItem transaction={item} key={index} />
    ))}
  </List>
);
const emptyTimelineContent = (
  <LabelSmall weight="Regular" color="bluegreyDark">
    {I18n.t(
      "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
    ) + " "}
    <LabelSmall weight="SemiBold">
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsLink"
      )}
    </LabelSmall>
  </LabelSmall>
);
type Operation = unknown;
type OperationList = Array<Operation>;
type TimelineDTO = { operationList: OperationList };

const InitiativeConfiguredData = (
  initiative: InitiativeDTO,
  timeline: TimelineDTO["operationList"]
) => {
  const isTimelineEmpty = timeline.length === 0;
  return (
    <>
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
        )}
      </H3>
      <View spacer />
      {/* HERE GOES TRANSACTION LIST */}
      {isTimelineEmpty ? emptyTimelineContent : TransactionsList(timeline)}
      {/* END OF TRANSACTION LIST */}
      <View spacer large />
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
        )}
      </H3>
      <View spacer small />
      <List>
        <ListItemComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
          )}
          subTitle={`${initiative.nInstr} ${I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.methodsi18n"
          )}`}
        />
        <ListItemComponent
          title={I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
          )}
          subTitle={initiative.iban}
        />
      </List>
    </>
  );
};

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
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  useEffect(() => {
    dispatch(idpayInitiativeGet.request({ initiativeId }));
  }, [dispatch, initiativeId]);

  const initiativeDetailsFromSelector = useIOSelector(
    idpayInitiativeDetailsSelector
  );

  const initiativeData: InitiativeDTO | undefined = pot.getOrElse(
    initiativeDetailsFromSelector,
    undefined
  );
  const isLoading = pot.isLoading(initiativeDetailsFromSelector);

  const initiativeNotConfiguredContent = (
    <View style={[styles.newInitiativeMessageContainer, IOStyles.flex]}>
      <EmptyInitiativeSvg width={130} height={130} />
      <View spacer />
      {/* eslint-disable-next-line react/no-unescaped-entities */}
      <H3>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.notConfigured.header"
        )}
      </H3>
      <View spacer />
      <Text style={styles.textCenter}>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.notConfigured.footer",
          { initiative: "18 app" }
        )}
      </Text>
    </View>
  );

  const navigateToConfiguration = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: "IDPAY_CONFIGURATION_INTRO",
      params: { initiativeId }
    });
  };

  const renderContent = () => {
    if (initiativeData === undefined) {
      return null;
    }

    const initiativeNeedsConfiguration =
      initiativeData.status === StatusEnum.NOT_REFUNDABLE;

    return (
      <SafeAreaView style={IOStyles.flex}>
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
            <View
              style={[IOStyles.horizontalContentPadding, { height: 149 }]}
            />
          </LinearGradient>
          <View style={styles.card}>
            <InitiativeCardComponent
              endDate={initiativeData.endDate}
              status={initiativeData.status}
              accrued={initiativeData.accrued}
              amount={initiativeData.amount}
              initiativeName={initiativeData.initiativeName}
            />
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
            {initiativeNeedsConfiguration
              ? initiativeNotConfiguredContent
              : InitiativeConfiguredData(initiativeData, [1, 2, 3])}
          </View>
        </ScrollView>
        {initiativeNeedsConfiguration && (
          <FooterWithButtons
            type="SingleButton"
            leftButton={{
              block: true,
              primary: true,
              onPress: navigateToConfiguration,
              title: I18n.t(
                "idpay.initiative.details.initiativeDetailsScreen.configured.startConfigurationCTA"
              )
            }}
          />
        )}
      </SafeAreaView>
    );
  };

  return (
    <BaseScreenComponent
      dark={true}
      titleColor={"white"}
      goBack={true}
      headerTitle={initiativeData?.initiativeName ?? ""}
      headerBackgroundColor={IOColors.bluegrey}
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
        {renderContent()}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};
