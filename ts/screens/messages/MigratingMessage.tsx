import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import doubtImage from "../../../img/pictograms/doubt.png";
import paymentCompletedImage from "../../../img/pictograms/payment-completed.png";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { H2 } from "../../components/core/typography/H2";
import { IOColors } from "../../components/core/variables/IOColors";
import { renderInfoRasterImage } from "../../components/infoScreen/imageRendering";
import I18n from "../../i18n";
import { MigrationStatus } from "../../store/reducers/entities/messages/allPaginated";
import customVariables from "../../theme/variables";

const styles = StyleSheet.create({
  migrationMessageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 60
  },
  migrationIconContainer: {
    height: 120
  },
  migrationMessageText: {
    textAlign: "center",
    marginBottom: 40
  },
  migrationMessageButtonText: {
    color: IOColors.white,
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 18,
    fontFamily: "TitilliumWeb"
  },
  activityIndicator: {
    padding: 12
  }
});

type Props = {
  status: MigrationStatus;
  onRetry: () => void;
  onEnd: () => void;
};

const MigratingMessage = ({ status, onRetry, onEnd }: Props) => {
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (pipe(status, O.toUndefined)?._tag === "succeeded") {
      setTimeout(onEnd, 1000);
    }
  }, [status, onEnd]);

  return pipe(
    status,
    O.fold(
      () => null,
      ongoing => {
        // eslint-disable-next-line no-underscore-dangle
        switch (ongoing._tag) {
          case "failed":
            return (
              <View style={styles.migrationMessageContainer}>
                <View style={styles.migrationIconContainer}>
                  {renderInfoRasterImage(doubtImage)}
                </View>
                <H2 style={styles.migrationMessageText}>
                  {I18n.t("messages.pagination.migration.failed")}
                </H2>
                <ButtonDefaultOpacity
                  primary={false}
                  disabled={false}
                  onPress={onRetry}
                  style={{ width: "100%" }}
                >
                  {/* TODO: Replace with BaseTypography component (custom Text
                componented based on RN Text) */}
                  <Text style={styles.migrationMessageButtonText}>
                    {I18n.t("global.buttons.retry")}
                  </Text>
                </ButtonDefaultOpacity>
              </View>
            );
          case "succeeded":
            return (
              <View style={styles.migrationMessageContainer}>
                <View style={styles.migrationIconContainer}>
                  {renderInfoRasterImage(paymentCompletedImage)}
                </View>
                <H2 style={styles.migrationMessageText}>
                  {I18n.t("messages.pagination.migration.succeeded")}
                </H2>
              </View>
            );
          case "started":
            return (
              <View style={styles.migrationMessageContainer}>
                <View style={styles.migrationIconContainer}>
                  <ActivityIndicator
                    animating={true}
                    size={"large"}
                    style={styles.activityIndicator}
                    color={customVariables.brandPrimary}
                    accessible={true}
                    accessibilityHint={I18n.t(
                      "global.accessibility.activityIndicator.hint"
                    )}
                    accessibilityLabel={I18n.t(
                      "global.accessibility.activityIndicator.label"
                    )}
                    importantForAccessibility={"no-hide-descendants"}
                    testID={"activityIndicator"}
                  />
                </View>
                <H2 style={styles.migrationMessageText}>
                  {I18n.t("messages.pagination.migration.started")}
                </H2>
              </View>
            );
        }
      }
    )
  );
};

export default MigratingMessage;
