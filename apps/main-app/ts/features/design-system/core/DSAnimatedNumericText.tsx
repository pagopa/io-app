import {
  H3,
  HStack,
  IOBannerRadius,
  IOButton,
  IOColors,
  IOText,
  LabelMini,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { useCallback, useEffect, useState } from "react";
import { View, ViewStyle } from "react-native";

import {
  AnimatedNumericText,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_WEIGHT
} from "../../../components/animatedNumericText";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const TOTAL_SECONDS = 60;
const TICK_INTERVAL_MS = 1000;
const INITIAL_AMOUNT_IN_CENTS = 12550;
const AMOUNT_STEP_IN_CENTS = 1250;

/** Neutral block the sample values are rendered on */
const blockStyle: ViewStyle = {
  borderRadius: IOBannerRadius,
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderWidth: 1
};

const halfStyle: ViewStyle = { flex: 1 };

const TITLE_MARGIN = 12;
const INNER_SPACING = 8;

const formatAsTimer = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const formatAsAmount = (cents: number) =>
  formatNumberCentsToAmount(cents, true, "right");

export const DSAnimatedNumericText = () => {
  const theme = useIOTheme();
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [amountInCents, setAmountInCents] = useState(INITIAL_AMOUNT_IN_CENTS);
  const [isAmountDecreasing, setIsAmountDecreasing] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(previous => {
        if (previous > 0) {
          return previous - 1;
        }
        setIsRunning(false);
        return TOTAL_SECONDS;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
  }, []);

  const changeAmount = useCallback((delta: number) => {
    setIsAmountDecreasing(delta < 0);
    setAmountInCents(previous => Math.max(0, previous + delta));
  }, []);

  return (
    <DesignSystemScreen title={"Animated numeric text"}>
      <VStack space={40}>
        <VStack space={TITLE_MARGIN}>
          <H3 color={theme["textHeading-default"]}>Countdown</H3>
          <VStack space={INNER_SPACING}>
            <View
              style={{
                ...blockStyle,
                borderColor: IOColors[theme["cardBorder-default"]]
              }}
            >
              <HStack space={16}>
                <VStack space={4} style={halfStyle}>
                  <LabelMini
                    color={theme["textBody-tertiary"]}
                    weight="Regular"
                  >
                    Baseline
                  </LabelMini>
                  <IOText
                    color={theme["textBody-default"]}
                    size={DEFAULT_FONT_SIZE}
                    style={{ opacity: 0.5 }}
                    weight={DEFAULT_FONT_WEIGHT}
                  >
                    {formatAsTimer(secondsLeft)}
                  </IOText>
                </VStack>
                <VStack space={4} style={halfStyle}>
                  <LabelMini
                    color={theme["textBody-tertiary"]}
                    weight="Regular"
                  >
                    Animated
                  </LabelMini>
                  <AnimatedNumericText
                    accessibilityLabel={`${secondsLeft} seconds left`}
                    color={theme["textBody-default"]}
                    formatValue={formatAsTimer}
                    value={secondsLeft}
                  />
                </VStack>
              </HStack>
            </View>
            <HStack space={8}>
              <View style={{ flex: 1 }}>
                <IOButton
                  fullWidth
                  label="Reset"
                  onPress={reset}
                  variant="outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <IOButton
                  fullWidth
                  label={isRunning ? "Pause" : "Start"}
                  onPress={() => setIsRunning(running => !running)}
                  variant="solid"
                />
              </View>
            </HStack>
          </VStack>
        </VStack>

        <VStack space={TITLE_MARGIN}>
          <H3 color={theme["textHeading-default"]}>Currency</H3>
          <VStack space={INNER_SPACING}>
            <View
              style={{
                ...blockStyle,
                borderColor: IOColors[theme["cardBorder-default"]]
              }}
            >
              <HStack space={16}>
                <VStack space={4} style={halfStyle}>
                  <LabelMini
                    color={theme["textBody-tertiary"]}
                    weight="Regular"
                  >
                    Baseline
                  </LabelMini>
                  <IOText
                    color={theme["textBody-default"]}
                    size={DEFAULT_FONT_SIZE}
                    style={{ opacity: 0.5 }}
                    weight={DEFAULT_FONT_WEIGHT}
                  >
                    {formatAsAmount(amountInCents)}
                  </IOText>
                </VStack>
                <VStack space={4} style={halfStyle}>
                  <LabelMini
                    color={theme["textBody-tertiary"]}
                    weight="Regular"
                  >
                    Animated
                  </LabelMini>
                  <AnimatedNumericText
                    accessibilityLabel={formatAsAmount(amountInCents)}
                    color={theme["textBody-default"]}
                    countsDown={isAmountDecreasing}
                    formatValue={formatAsAmount}
                    value={amountInCents}
                  />
                </VStack>
              </HStack>
            </View>
            <HStack space={8}>
              <View style={{ flex: 1 }}>
                <IOButton
                  fullWidth
                  label={`− ${formatAsAmount(AMOUNT_STEP_IN_CENTS)}`}
                  onPress={() => changeAmount(-AMOUNT_STEP_IN_CENTS)}
                  variant="outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <IOButton
                  fullWidth
                  label={`+ ${formatAsAmount(AMOUNT_STEP_IN_CENTS)}`}
                  onPress={() => changeAmount(AMOUNT_STEP_IN_CENTS)}
                  variant="outline"
                />
              </View>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};
