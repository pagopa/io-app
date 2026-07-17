import {
  IOButton,
  ListItemHeader,
  ListItemInfo,
  TextInput,
  VSpacer
} from "@io-app/design-system";
import { useState } from "react";

import {
  DEFAULT_ROLLOUT_PERCENTAGE,
  DEFAULT_SAMPLE_SIZE,
  DISTRIBUTION_BUCKET_WIDTH,
  DistributionSimulationResult,
  parseRolloutPercentage,
  parseSampleSize,
  runDistributionSimulation
} from "./utils";

type SimulationState =
  | { progress: number; status: "running" }
  | { result: DistributionSimulationResult; status: "completed" }
  | { status: "idle" };

/**
 * Lets the user simulate the rollout distribution over a synthetic dataset
 * of device IDs, comparing the observed enabled percentage against the
 * expected one. Fully self-contained: the sample size and the rollout
 * percentage are all local to this section.
 *
 * Generation and hashing run in a single chunked pass on the JS thread
 * (see `runDistributionSimulation`): for large sample sizes this can still
 * noticeably slow down the UI, which is an accepted trade-off for this
 * dev-only tool. The progress indicator gives the user feedback while it
 * runs. There is no upper bound on the sample size, so it's on the user to
 * pick a value the device can handle in reasonable time.
 */
export const DistributionSection = () => {
  const [sampleSizeInput, setSampleSizeInput] = useState(DEFAULT_SAMPLE_SIZE);
  const [rolloutPercentageInput, setRolloutPercentageInput] = useState(
    DEFAULT_ROLLOUT_PERCENTAGE
  );
  const [simulationState, setSimulationState] = useState<SimulationState>({
    status: "idle"
  });

  const handleRunSimulation = async () => {
    const sampleSize = parseSampleSize(sampleSizeInput);
    if (sampleSize === 0) {
      return;
    }
    const rolloutPercentage = parseRolloutPercentage(rolloutPercentageInput);
    setSimulationState({ status: "running", progress: 0 });
    const result = await runDistributionSimulation(
      sampleSize,
      rolloutPercentage,
      progress => setSimulationState({ status: "running", progress })
    );
    setSimulationState({ status: "completed", result });
  };

  const isRunning = simulationState.status === "running";
  const distributionResult =
    simulationState.status === "completed" ? simulationState.result : undefined;
  const progressLabel = isRunning ? `${simulationState.progress}%` : undefined;

  return (
    <>
      <ListItemHeader label="Distribuzione su un campione" />
      <TextInput
        accessibilityHint="Numero di device ID da generare"
        accessibilityLabel="Dimensione del campione"
        onChangeText={setSampleSizeInput}
        placeholder="Dimensione campione"
        value={sampleSizeInput}
      />
      <VSpacer size={16} />
      <TextInput
        accessibilityHint="Percentuale di rollout"
        accessibilityLabel="Percentuale di rollout"
        onChangeText={setRolloutPercentageInput}
        placeholder="Rollout %"
        value={rolloutPercentageInput}
      />
      <VSpacer size={16} />
      <IOButton
        label="Avvia test di distribuzione"
        loading={isRunning}
        onPress={handleRunSimulation}
        variant="solid"
      />
      {progressLabel && (
        <>
          <VSpacer size={16} />
          <ListItemInfo
            endElement={{
              type: "badge",
              componentProps: { text: progressLabel, variant: "default" }
            }}
            value="Avanzamento"
          />
        </>
      )}
      {distributionResult && (
        <>
          <VSpacer size={16} />
          <ListItemInfo
            endElement={{
              type: "badge",
              componentProps: {
                text: `${distributionResult.expectedPercentage}%`,
                variant: "default"
              }
            }}
            label="Percentuale di rollout impostata"
            value="Percentuale attesa"
          />
          <ListItemInfo
            endElement={{
              type: "badge",
              componentProps: {
                text: `${distributionResult.observedPercentage.toFixed(2)}%`,
                variant: "default"
              }
            }}
            label={`Quota realmente abilitata sui ${distributionResult.sampleSize} device generati`}
            value="Percentuale osservata"
          />
          <VSpacer size={16} />
          <ListItemHeader label="Distribuzione di frequenza per bucket" />
          {distributionResult.buckets.map(bucket => (
            <ListItemInfo
              endElement={{
                type: "badge",
                componentProps: {
                  text: `${bucket.count}`,
                  variant: "default"
                }
              }}
              key={bucket.rangeStart}
              value={`${bucket.rangeStart}% - ${
                bucket.rangeStart + DISTRIBUTION_BUCKET_WIDTH
              }%`}
            />
          ))}
        </>
      )}
    </>
  );
};
