import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation, useRoute } from "@react-navigation/core";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { Text, View } from "native-base";
import React, { useCallback } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import EmptyInitiativeSvg from "../../../../../../img/features/idpay/empty_initiative.svg";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
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
import { InitiativeSettingsComponent } from "../components/InitiativeSettingsComponent";
import InitiativeTimelineComponent from "../components/InitiativeTimelineComponent";
import { idpayInitiativeDetailsSelector } from "../store";
import { idpayInitiativeGet } from "../store/actions";
import { IDPayDetailsParamsList } from "../navigation";

const styles = StyleSheet.create({
  newInitiativeMessageContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  textCenter: {
    textAlign: "center"
  },
  flexGrow: {
    flexGrow: 1
  },
  paddedContent: {
    flex: 1,
    paddingTop: 80
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
    <View spacer />
    <H3>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.notConfigured.header"
      )}
    </H3>
    <View spacer />
    <Text style={styles.textCenter}>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.notConfigured.footer",
        { initiative: initiativeName }
      )}
    </Text>
  </View>
);

export const InitiativeDetailsScreen = () => {
  const route = useRoute<InitiativeDetailsScreenRouteProps>();

  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const navigateToConfiguration = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
      params: { initiativeId }
    });
  };

  useFocusEffect(
    useCallback(() => {
      dispatch(idpayInitiativeGet.request({ initiativeId }));
    }, [dispatch, initiativeId])
  );

  const initiativeDetailsFromSelector = useIOSelector(
    idpayInitiativeDetailsSelector
  );

  const initiativeData: InitiativeDTO | undefined = pot.getOrElse(
    initiativeDetailsFromSelector,
    undefined
  );

  const isLoading = pot.isLoading(initiativeDetailsFromSelector);

  const renderContent = () => {
    if (initiativeData === undefined) {
      return null;
    }

    const initiativeNeedsConfiguration =
      initiativeData.status === StatusEnum.NOT_REFUNDABLE;

    return (
      <SafeAreaView style={IOStyles.flex}>
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
          <InitiativeCardComponent
            endDate={initiativeData.endDate}
            status={initiativeData.status}
            accrued={initiativeData.accrued}
            amount={initiativeData.amount}
            initiativeName={initiativeData.initiativeName}
          />
          <View
            style={[
              IOStyles.flex,
              IOStyles.horizontalContentPadding,
              styles.flexGrow,
              {
                paddingTop: customVariables.contentPadding
              }
            ]}
          >
            <View style={styles.paddedContent}>
              {initiativeNeedsConfiguration && (
                <InitiativeNotConfiguredComponent
                  initiativeName={initiativeData.initiativeName ?? ""}
                />
              )}
              {!initiativeNeedsConfiguration && (
                <>
                  <InitiativeTimelineComponent
                    initiativeId={initiativeData.initiativeId}
                  />
                  <View spacer large />
                  <InitiativeSettingsComponent initiative={initiativeData} />
                </>
              )}
            </View>
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
      headerTitle={initiativeData?.initiativeName}
      headerBackgroundColor={IOColors.bluegrey}
    >
      <FocusAwareStatusBar
        backgroundColor={IOColors.bluegrey}
        barStyle={"light-content"}
      />
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
        {renderContent()}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};
