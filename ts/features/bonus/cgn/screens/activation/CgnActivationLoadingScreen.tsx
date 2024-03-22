import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  Body,
  ContentWrapper,
  H3,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { isCgnActivationLoading } from "../../store/reducers/activation";
import {
  cgnActivationCancel,
  cgnRequestActivation
} from "../../store/actions/activation";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { LoadingIndicator } from "../../../../../components/ui/LoadingIndicator";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";

const styles = StyleSheet.create({
  container: {
    ...IOStyles.bgWhite,
    ...IOStyles.centerJustified,
    ...IOStyles.flex
  },
  contentTitle: {
    textAlign: "center"
  },
  content: {
    alignItems: "center"
  }
});

const LoadingComponent = () => (
  <SafeAreaView style={styles.container}>
    <ContentWrapper>
      <View style={styles.content}>
        <View
          accessible={false}
          accessibilityElementsHidden={true}
          importantForAccessibility={"no-hide-descendants"}
        >
          <LoadingIndicator />
        </View>
        <VSpacer size={24} />
        <H3 style={styles.contentTitle}>
          {I18n.t("bonus.cgn.activation.loading.caption")}
        </H3>
        <VSpacer size={24} />
        <Body>{I18n.t("bonus.cgn.activation.loading.subCaption")}</Body>
      </View>
    </ContentWrapper>
  </SafeAreaView>
);

const ErrorComponent = () => {
  const dispatch = useIODispatch();

  const onRetry = () => dispatch(cgnRequestActivation());
  const onCancel = () => dispatch(cgnActivationCancel());

  return (
    <OperationResultScreenContent
      pictogram={"umbrellaNew"}
      title={I18n.t("bonus.cgn.activation.error.title")}
      subtitle={I18n.t("bonus.cgn.activation.error.body")}
      action={{
        accessibilityLabel: I18n.t("global.buttons.retry"),
        label: I18n.t("global.buttons.retry"),
        onPress: onRetry
      }}
      secondaryAction={{
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        label: I18n.t("global.buttons.cancel"),
        onPress: onCancel
      }}
    />
  );
};
/**
 * Screen which is displayed when a user requested a CGN activation and we are waiting for the result from the backend
 */
const CgnActivationLoadingScreen = () => {
  const isLoading = useIOSelector(isCgnActivationLoading);

  return isLoading ? <LoadingComponent /> : <ErrorComponent />;
};

export default CgnActivationLoadingScreen;
