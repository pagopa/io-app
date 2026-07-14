import {
  Body,
  Divider,
  IOButton,
  IOColors,
  IOSpringValues,
  ListItemHeader,
  ListItemSwitch,
  useIOTheme,
  VStack
} from "@io-app/design-system";
import { ComponentProps, useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  LayoutAnimationConfig,
  LinearTransition,
  useReducedMotion,
  withDelay,
  withSpring
} from "react-native-reanimated";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import DESIGN_SYSTEM_ROUTES from "../navigation/routes";

/**
 * Spring config for the transition applied to the secondary switches
 */
const SPRING_CONFIG = IOSpringValues.accordion;
/**
 * Delay (ms) added per switch position, so each one trails the previous.
 */
const STAGGER_DELAY = 75;
/**
 * Vertical offset (in points) applied to the secondary switches
 */
const TRANSLATE_Y = 16;

/**
 * Custom enter transition for the secondary switches. `delay` staggers the
 * reveal so each switch trails the previous one.
 */
const enterToggleTransition = (delay: number) => () => {
  "worklet";
  return {
    initialValues: {
      opacity: 0,
      transform: [{ translateY: -TRANSLATE_Y }]
    },
    animations: {
      opacity: withDelay(delay, withSpring(1, SPRING_CONFIG)),
      transform: [
        { translateY: withDelay(delay, withSpring(0, SPRING_CONFIG)) }
      ]
    }
  };
};

const exitToggleTransition = () => {
  "worklet";
  return {
    initialValues: {
      opacity: 1,
      transform: [{ translateY: 0 }]
    },
    animations: {
      opacity: withSpring(0, SPRING_CONFIG),
      transform: [{ translateY: withSpring(-TRANSLATE_Y, SPRING_CONFIG) }]
    }
  };
};

/**
 * Layout transition shared by the reflowing containers.
 */
const LAYOUT_TRANSITION = LinearTransition.springify()
  .mass(SPRING_CONFIG.mass)
  .damping(SPRING_CONFIG.damping)
  .stiffness(SPRING_CONFIG.stiffness);

const styles = StyleSheet.create({
  placeholder: {
    height: 120,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  }
});

/**
 * Inert grey box used to visualize how surrounding content reflows while the
 * animated list changes height.
 */
const PlaceholderBox = ({
  label,
  layout
}: {
  label: string;
  layout?: ComponentProps<typeof Animated.View>["layout"];
}) => {
  const theme = useIOTheme();

  return (
    <Animated.View
      layout={layout}
      style={[
        styles.placeholder,
        { backgroundColor: IOColors[theme["appBackground-secondary"]] }
      ]}
      accessible
      accessibilityLabel={label}
    >
      <Body color={theme["textBody-tertiary"]}>{label}</Body>
    </Animated.View>
  );
};

/**
 * Experimental rebuild of the `ServiceDetailsPreferences` block.
 *
 * The first ("main") switch acts as a master toggle: the two dependent
 * switches are only mounted while it is on.
 */
export const DSServicePreferences = () => {
  // States for the main switch.
  const [isMainEnabled, setIsMainEnabled] = useState(true);
  const [isMainDisabled, setIsMainDisabled] = useState(false);
  // States for the secondary switches.
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isReadStatusEnabled, setIsReadStatusEnabled] = useState(false);
  // Simulates the app-level remote flag that gates the read-status switch's
  // visibility (not a per-service preference).
  const [isPremium, setIsPremium] = useState(true);

  const reduceMotion = useReducedMotion();

  const layoutTransition = reduceMotion ? undefined : LAYOUT_TRANSITION;
  const exitTransition = reduceMotion ? undefined : exitToggleTransition;

  const getEnterTransition = (index: number) =>
    reduceMotion ? undefined : enterToggleTransition(index * STAGGER_DELAY);

  const toggleMainDisabled = useCallback(
    () => setIsMainDisabled(prev => !prev),
    []
  );

  const togglePremium = useCallback(() => setIsPremium(prev => !prev), []);

  return (
    <DesignSystemScreen
      title={DESIGN_SYSTEM_ROUTES.EXPERIMENTAL_LAB.SERVICE_PREFERENCES.title}
    >
      <VStack space={24}>
        <PlaceholderBox label="Box above" />

        <Animated.View layout={layoutTransition}>
          <ListItemHeader label="Questo servizio può" />
          <ListItemSwitch
            icon="message"
            label="Contattarti in app"
            description="Preferenza principale che controlla le opzioni qui sotto"
            value={isMainEnabled}
            disabled={isMainDisabled}
            onSwitchValueChange={setIsMainEnabled}
          />

          {/* Skips the dependent switches' entering animations on the screen's
              first mount, while still animating later toggles off→on. */}
          <LayoutAnimationConfig skipEntering>
            {isMainEnabled && (
              <>
                <Animated.View
                  entering={getEnterTransition(0)}
                  exiting={exitTransition}
                  layout={layoutTransition}
                >
                  <Divider />
                  <ListItemSwitch
                    icon="bell"
                    label="Inviarti notifiche push"
                    value={isPushEnabled}
                    onSwitchValueChange={setIsPushEnabled}
                  />
                </Animated.View>
                {/* Gated by the premium flag, mirroring the original
                    `isInboxPreferenceEnabled && isPremiumMessagesOptInOutEnabled`. */}
                {isPremium && (
                  <Animated.View
                    entering={getEnterTransition(1)}
                    exiting={exitTransition}
                    layout={layoutTransition}
                  >
                    <Divider />
                    <ListItemSwitch
                      icon="read"
                      label="Ricevere conferme di lettura"
                      value={isReadStatusEnabled}
                      onSwitchValueChange={setIsReadStatusEnabled}
                    />
                  </Animated.View>
                )}
              </>
            )}
          </LayoutAnimationConfig>
        </Animated.View>

        <PlaceholderBox label="Box below" layout={layoutTransition} />

        <Animated.View layout={layoutTransition}>
          <VStack space={8}>
            <IOButton
              variant="solid"
              label={
                isMainDisabled ? "Enable main switch" : "Disable main switch"
              }
              onPress={toggleMainDisabled}
            />
            <IOButton
              variant="outline"
              label={isPremium ? "Disable premium" : "Enable premium"}
              onPress={togglePremium}
            />
          </VStack>
        </Animated.View>
      </VStack>
    </DesignSystemScreen>
  );
};
