import React from "react";

export type UnsubscriptionCheck = {
  title: string;
  subtitle: string;
  value: boolean;
};

export const useUnsubscriptionChecks = (
  initialChecks: ReadonlyArray<UnsubscriptionCheck>
) => {
  const [checks, setChecks] =
    React.useState<ReadonlyArray<UnsubscriptionCheck>>(initialChecks);

  const areChecksFullfilled = !checks.find(c => !c.value);

  const toggleCheck = (atIndex: number) =>
    setChecks(currentChecks => [
      ...currentChecks.slice(0, atIndex),
      {
        ...currentChecks[atIndex],
        value: !currentChecks[atIndex].value
      },
      ...currentChecks.slice((atIndex as number) + 1)
    ]);

  return { checks, toggleCheck, areChecksFullfilled };
};
