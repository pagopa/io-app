import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation, useRoute } from "@react-navigation/core";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { format } from "date-fns";
import React, { useCallback } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import EmptyInitiativeSvg from "../../../../../../img/features/idpay/empty_initiative.svg";
import { Alert } from "../../../../../components/Alert";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
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
import {
  IDPayConfigurationParamsList,
  IDPayConfigurationRoutes
} from "../../configuration/navigation/navigator";
import InitiativeCardComponent from "../components/InitiativeCardComponent";
import { InitiativeSettingsComponent } from "../components/InitiativeSettingsComponent";
import InitiativeTimelineComponent from "../components/InitiativeTimelineComponent";
import { IDPayDetailsParamsList, IDPayDetailsRoutes } from "../navigation";
import {
  idpayInitiativeDetailsSelector,
  idpayOperationListLengthSelector
} from "../store";
import { idpayInitiativeGet, idpayTimelinePageGet } from "../store/actions";

const styles = StyleSheet.create({
  newInitiativeMessageContainer: {
    alignItems: "center",
    justifyContent: "center"
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
  }
});

export type InitiativeDetailsScreenParams = {
  initiativeId: string;
};

type InitiativeDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_MONITORING"
>;

const InitiativeNotConfiguredComponent = ({
  initiativeName
}: {
  initiativeName: string;
}) => (
  <View style={[styles.newInitiativeMessageContainer, IOStyles.flex]}>
    <EmptyInitiativeSvg width={130} height={130} />
    <VSpacer size={16} />
    <H3>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.notConfigured.header"
      )}
    </H3>
    <VSpacer size={16} />
    <View style={IOStyles.alignCenter}>
      <Body>
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.notConfigured.footer",
          { initiative: initiativeName }
        )}
      </Body>
    </View>
  </View>
);

export const InitiativeDetailsScreen = () => {
  const route = useRoute<InitiativeDetailsScreenRouteProps>();

  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const initiativeDetailsFromSelector = useIOSelector(
    idpayInitiativeDetailsSelector
  );

  const initiativeData: InitiativeDTO | undefined = pot.getOrElse(
    initiativeDetailsFromSelector,
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

  const isLoading = pot.isLoading(initiativeDetailsFromSelector);
  const timelineLength = useIOSelector(idpayOperationListLengthSelector);
  const isFirstInitiativeConfiguration = timelineLength <= 1;

  const renderContent = () => {
    if (initiativeData === undefined) {
      return null;
    }

    const lastUpdated =
      initiativeData.lastCounterUpdate !== undefined
        ? format(initiativeData.lastCounterUpdate, "DD/MM/YYYY, HH:mm")
        : undefined;

    const initiativeNeedsConfiguration =
      initiativeData.status === StatusEnum.NOT_REFUNDABLE &&
      isFirstInitiativeConfiguration;

    return (
      <>
        <ScrollView style={styles.scroll} scrollIndicatorInsets={{ right: 1 }}>
          <InitiativeCardComponent initiative={initiativeData} />
          <View style={[IOStyles.horizontalContentPadding, styles.container]}>
            <VSpacer size={16} />
            <View style={IOStyles.flex}>
              {initiativeNeedsConfiguration && (
                <InitiativeNotConfiguredComponent
                  initiativeName={initiativeData.initiativeName ?? ""}
                />
              )}
              {!initiativeNeedsConfiguration && (
                <>
                  {lastUpdated && (
                    <>
                      <LabelSmall
                        style={{ alignSelf: "center" }}
                        color="bluegrey"
                        weight="Regular"
                      >
                        {I18n.t(
                          "idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.lastUpdated"
                        )}
                        {lastUpdated}
                      </LabelSmall>
                      <VSpacer size={16} />
                    </>
                  )}
                  <MissingInitiativeDataAlert initiativeData={initiativeData} />
                  <InitiativeTimelineComponent
                    initiativeId={initiativeData.initiativeId}
                  />
                  <VSpacer size={24} />
                  <InitiativeSettingsComponent initiative={initiativeData} />
                </>
              )}
            </View>
          </View>
          <VSpacer size={32} />
        </ScrollView>
        {initiativeNeedsConfiguration && (
          <SafeAreaView style={IOStyles.flex}>
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
        )}
      </>
    );
  };

  const handleBeneficiaryDetailsPress = () => {
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY,
      params: {
        initiativeId
      }
    });
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerBackgroundColor={IOColors["blue-50"]}
      contextualHelp={emptyContextualHelp}
      customRightIcon={{
        iconName: "io-info",
        onPress: handleBeneficiaryDetailsPress
      }}
    >
      <FocusAwareStatusBar
        backgroundColor={IOColors["blue-50"]}
        barStyle={"dark-content"}
      />
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
        {isLoading ? null : renderContent()}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};
type StatusWithAlert = Exclude<
  StatusEnum,
  StatusEnum.REFUNDABLE | StatusEnum.UNSUBSCRIBED
>;

const MissingInitiativeDataAlert = ({
  initiativeData
}: {
  initiativeData: InitiativeDTO;
}) => {
  const { status, initiativeId } = initiativeData;
  const navigation = useNavigation();

  if (status === StatusEnum.UNSUBSCRIBED || status === StatusEnum.REFUNDABLE) {
    return null;
  }

  const viewRef = React.createRef<View>();

  const screen: Record<StatusWithAlert, keyof IDPayConfigurationParamsList> = {
    NOT_REFUNDABLE_ONLY_IBAN:
      IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
    NOT_REFUNDABLE_ONLY_INSTRUMENT:
      IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
    NOT_REFUNDABLE: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO
  };

  const handleNavigation = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: screen[status],
      params: {
        initiativeId
      }
    });
  };

  return (
    <>
      <Alert
        viewRef={viewRef}
        content={I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.${status}.content`
        )}
        action={I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.errorAlerts.${status}.action`
        )}
        onPress={handleNavigation}
        variant="error"
      />
      <VSpacer size={16} />
    </>
  );
};
