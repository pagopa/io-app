/**
 * This function removes the tag from payment description of a PagoPA transaction.
 * @see https://pagopa-codici.readthedocs.io/it/latest/_docs/Capitolo3.html
 */

export const cleanPaymentDescription = (description: string): string => {
  const descriptionParts = description.split("/TXT/");

  return descriptionParts[descriptionParts.length - 1].trim();
};
