import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation, useRoute } from "@react-navigation/core";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useCallback } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import EmptyInitiativeSvg from "../../../../../../img/features/idpay/empty_initiative.svg";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";
import {
  InitiativeCardComponent,
  InitiativeCardComponentSkeleton
} from "../components/InitiativeCardComponent";
import { InitiativeSettingsComponent } from "../components/InitiativeSettingsComponent";
import InitiativeTimelineComponent from "../components/InitiativeTimelineComponent";
import { MissingConfigurationAlert } from "../components/MissingConfigurationAlert";
import { IDPayDetailsParamsList } from "../navigation";
import {
  idpayInitiativeDetailsSelector,
  initiativeNeedsConfigurationSelector
} from "../store";
import { idpayInitiativeGet, idpayTimelinePageGet } from "../store/actions";

export type InitiativeDetailsScreenParams = {
  initiativeId: string;
};

type InitiativeDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_MONITORING"
>;

const InitiativeDetailsScreen = () => {
  const route = useRoute<InitiativeDetailsScreenRouteProps>();

  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);

  const initiativeData: InitiativeDTO | undefined = pot.getOrElse(
    initiativeDataPot,
    undefined
  );

  const navigateToConfiguration = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
      params: { initiativeId }
    });
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(idpayInitiativeGet.request({ initiativeId }));
      dispatch(idpayTimelinePageGet.request({ initiativeId, page: 0 }));
    }, [dispatch, initiativeId])
  );

  const initiativeNeedsConfiguration = useIOSelector(
    initiativeNeedsConfigurationSelector
  );

  const lastUpdateComponent = pipe(
    initiativeData?.lastCounterUpdate,
    O.fromNullable,
    O.map(date => format(date, "DD/MM/YYYY, HH:mm")),
    O.fold(
      () => (
        <View style={styles.lastUpdate}>
          <Placeholder.Box animate="fade" width={180} height={16} radius={4} />
        </View>
      ),
      lastUpdated => (
        <LabelSmall style={styles.lastUpdate} color="bluegrey" weight="Regular">
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.lastUpdated"
          )}
          {lastUpdated}
        </LabelSmall>
      )
    )
  );

  const missingConfigurationAlertComponent = pipe(
    initiativeData,
    O.fromNullable,
    O.map(({ status }) => status),
    O.fold(
      () => null,
      status => (
        <MissingConfigurationAlert
          initiativeId={initiativeId}
          status={status}
        />
      )
    )
  );

  const renderScreenContent = () => {
    if (initiativeNeedsConfiguration) {
      return (
        <View style={styles.newInitiativeMessageContainer}>
          <EmptyInitiativeSvg width={130} height={130} />
          <VSpacer size={16} />
          <H3>
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.notConfigured.header"
            )}
          </H3>
          <VSpacer size={8} />
          <Body style={{ textAlign: "center" }}>
            {I18n.t(
              "idpay.initiative.details.initiativeDetailsScreen.notConfigured.footer",
              { initiative: initiativeData?.initiativeName }
            )}
          </Body>
        </View>
      );
    }

    return (
      <ContentWrapper>
        {lastUpdateComponent}
        {missingConfigurationAlertComponent}
        <InitiativeTimelineComponent initiativeId={initiativeId} />
        <VSpacer size={24} />
        <InitiativeSettingsComponent initiative={initiativeData} />
      </ContentWrapper>
    );
  };

  const configurationButton = initiativeNeedsConfiguration && (
    <SafeAreaView>
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
    </SafeAreaView>
  );

  const cardComponent = pipe(
    initiativeData,
    O.fromNullable,
    O.fold(
      () => <InitiativeCardComponentSkeleton />,
      initiative => <InitiativeCardComponent initiative={initiative} />
    )
  );

  return (
    <BaseScreenComponent
      goBack={true}
      headerBackgroundColor={IOColors["blue-50"]}
      contextualHelp={emptyContextualHelp}
    >
      <FocusAwareStatusBar
        backgroundColor={IOColors["blue-50"]}
        barStyle={"dark-content"}
      />
      <ScrollView style={styles.scroll} scrollIndicatorInsets={{ right: 1 }}>
        {cardComponent}
        <View style={styles.container}>{renderScreenContent()}</View>
        <VSpacer size={32} />
      </ScrollView>
      {configurationButton}
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  newInitiativeMessageContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexGrow: 1,
    padding: 32
  },
  scroll: {
    backgroundColor: IOColors["blue-50"]
  },
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: IOColors.white,
    zIndex: -1,
    top: -50,
    paddingTop: 50,
    paddingBottom: 500,
    marginBottom: -500
  },
  lastUpdate: {
    alignSelf: "center",
    alignItems: "center",
    padding: 16
  }
});

export { InitiativeDetailsScreen };
