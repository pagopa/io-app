import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import IconFont from "../../../components/ui/IconFont";
import { IOColors } from "../../../components/core/variables/IOColors";
import { H2 } from "../../../components/core/typography/H2";
import I18n from "../../../i18n";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import customVariables from "../../../theme/variables";
import { MigrationStatus } from "../../../store/reducers/entities/messages/allPaginated";

const styles = StyleSheet.create({
  migrationMessageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 60
  },
  migrationIconContainer: {
    height: 80
  },
  migrationMessageText: {
    textAlign: "center",
    marginBottom: 40
  },
  migrationMessageButtonText: {
    color: IOColors.white
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

const MigratingMessage = ({ status, onRetry }: Props) => {
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (status.toUndefined()?._tag === "succeeded") {
      setTimeout(onRetry, 2000);
    }
  }, [status]);

  return status.fold(null, ongoing => {
    // eslint-disable-next-line no-underscore-dangle
    switch (ongoing._tag) {
      case "failed":
        return (
          <View style={styles.migrationMessageContainer}>
            <View style={styles.migrationIconContainer}>
              <IconFont size={48} color={IOColors.blue} name={"io-sad"} />
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
              <IconFont size={48} color={IOColors.blue} name={"io-happy"} />
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
  });
};

export default MigratingMessage;
