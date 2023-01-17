function needsContentDigestValidation(requestBody: string): boolean {
  return (
    requestBody !== null && requestBody !== undefined && requestBody.length > 0
  );
}

export { needsContentDigestValidation };
