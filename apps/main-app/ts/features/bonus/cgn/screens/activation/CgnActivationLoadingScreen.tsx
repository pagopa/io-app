import { Body, ContentWrapper, H3, VStack } from "@pagopa/io-app-design-system";
import { useRef } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { LoadingIndicator } from "../../../../../components/ui/LoadingIndicator";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { setAccessibilityFocus } from "../../../../../utils/accessibility";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { cgnActivationCancel } from "../../store/actions/activation";
import { isCgnActivationLoading } from "../../store/reducers/activation";

const LoadingComponent = () => {
  const ref = useRef<View>(null);

  useOnFirstRender(() => {
    setAccessibilityFocus(ref);
  });

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center" }}
      accessible
      ref={ref}
    >
      <ContentWrapper>
        <VStack space={24} style={{ alignItems: "center" }}>
          <View
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility={"no-hide-descendants"}
          >
            <LoadingIndicator />
          </View>
          <H3 style={{ textAlign: "center" }}>
            {I18n.t("bonus.cgn.activation.loading.caption")}
          </H3>
          <Body style={{ textAlign: "center" }}>
            {I18n.t("bonus.cgn.activation.loading.subCaption")}
          </Body>
        </VStack>
      </ContentWrapper>
    </SafeAreaView>
  );
};

const ErrorComponent = () => {
  const dispatch = useIODispatch();

  const onCancel = () => dispatch(cgnActivationCancel());

  return (
    <OperationResultScreenContent
      pictogram={"umbrella"}
      title={I18n.t("bonus.cgn.activation.error.title")}
      subtitle={I18n.t("bonus.cgn.activation.error.body")}
      action={{
        accessibilityLabel: I18n.t("global.buttons.close"),
        label: I18n.t("global.buttons.close"),
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
