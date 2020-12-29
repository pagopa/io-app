export const isInGracePeriod = (limitDate: Date, gracePeriod: number) => {
  const actualDate = new Date();
  const endDate = new Date(limitDate.getTime());
  endDate.setDate(limitDate.getDate() + gracePeriod);

  return (
    actualDate.getTime() >= limitDate.getTime() &&
    actualDate.getTime() <= endDate.getTime()
  );
};
