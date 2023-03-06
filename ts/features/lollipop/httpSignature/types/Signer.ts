export interface Signer {
  sign(payload: string, keyTag: string): Promise<string>;
}
