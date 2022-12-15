import * as pot from "@pagopa/ts-commons/lib/pot";
import { Route, useNavigation, useRoute } from "@react-navigation/core";
import { useFocusEffect } from "@react-navigation/native";
import { List, Text, View } from "native-base";
import React, { useCallback, useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import EmptyInitiativeSvg from "../../../../../../img/features/idpay/empty_initiative.svg";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import TypedI18n from "../../../../../i18n";
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

const InitiativeSettings = (initiative: InitiativeDTO) => (
  <>
    <H3>
      {TypedI18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
      )}
    </H3>
    <View spacer xsmall />
    <LabelSmall weight="Regular" color="bluegreyDark">
      {TypedI18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
      ) + " "}
      <LabelSmall weight="SemiBold">
        {TypedI18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsLink"
        )}
      </LabelSmall>
    </LabelSmall>
    <View spacer extralarge />
    <H3>
      {TypedI18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.settings.header"
      )}
    </H3>
    <View spacer small />
    <List>
      <ListItemComponent
        title={TypedI18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.associatedPaymentMethods"
        )}
        subTitle={`${initiative.nInstr} ${TypedI18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.methodsi18n"
        )}`}
      />
      <ListItemComponent
        title={TypedI18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.settings.selectedIBAN"
        )}
        subTitle={initiative.iban}
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
  const firstFocusRef = React.useRef<boolean>(true);
  const route = useRoute<RouteProps>();
  const { initiativeId } = route.params;
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  useFocusEffect(
    useCallback(() => {
      if (firstFocusRef.current === true) {
        // eslint-disable-next-line functional/immutable-data
        firstFocusRef.current = false;
      } else {
        dispatch(idpayInitiativeGet.request({ initiativeId }));
      }
    }, [dispatch, initiativeId])
  );

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
        {TypedI18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.notConfigured.header"
        )}
      </H3>
      <View spacer />
      <Text style={styles.textCenter}>
        {TypedI18n.t(
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
          <InitiativeCardComponent
            endDate={initiativeData.endDate}
            status={initiativeData.status}
            accrued={initiativeData.accrued}
            amount={initiativeData.amount}
            initiativeName={initiativeData.initiativeName}
          />

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
            <View style={styles.paddedContent}>
              {initiativeNeedsConfiguration
                ? initiativeNotConfiguredContent
                : InitiativeSettings(initiativeData)}
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
              title: TypedI18n.t(
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
