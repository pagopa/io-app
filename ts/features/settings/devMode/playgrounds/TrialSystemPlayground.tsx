import {
  Body,
  ContentWrapper,
  H3,
  IOButton,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { useEffect } from "react";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  isLoadingTrialStatusSelector,
  isUpdatingTrialStatusSelector,
  trialStatusSelector
} from "../../../trialSystem/store/reducers";
import { TrialId } from "../../../../../definitions/trial_system/TrialId";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusUpsert
} from "../../../trialSystem/store/actions";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center"
  }
});

const TRIAL_ID = "test-trial-id" as TrialId;

const TrialSystemPlayground = () => {
  const dispatch = useIODispatch();
  const trialStatus = useIOSelector(trialStatusSelector(TRIAL_ID));
  const isTrialStatusLoading = useIOSelector(
    isLoadingTrialStatusSelector(TRIAL_ID)
  );

  const isTrialStatusUpdating = useIOSelector(
    isUpdatingTrialStatusSelector(TRIAL_ID)
  );

  useEffect(() => {
    dispatch(trialSystemActivationStatus.request(TRIAL_ID));
  }, [dispatch]);

  useHeaderSecondLevel({
    title: "Sistema di  Sperimentazione Playground"
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ContentWrapper>
        <H3>{"Sperimentazione di IT-Wallet"}</H3>
        <VSpacer />
        <View style={styles.row}>
          <Body color="black" weight="Semibold">
            {"Stato attuale: "}
          </Body>
          <Body color="black" weight="Semibold">
            {trialStatus ? trialStatus : "Non presente"}
          </Body>
        </View>
        <VSpacer />

        {!isTrialStatusLoading && (
          <>
            {trialStatus === undefined ||
            trialStatus === SubscriptionStateEnum.UNSUBSCRIBED ? (
              <IOButton
                fullWidth
                variant="solid"
                loading={isTrialStatusUpdating}
                label={I18n.t("profile.main.trial.titleSection")}
                onPress={() =>
                  dispatch(trialSystemActivationStatusUpsert.request(TRIAL_ID))
                }
              />
            ) : (
              <IOButton
                fullWidth
                variant="solid"
                color="danger"
                label={"Disiscriviti"}
                onPress={constNull}
              />
            )}
          </>
        )}
      </ContentWrapper>
    </SafeAreaView>
  );
};

export default TrialSystemPlayground;
