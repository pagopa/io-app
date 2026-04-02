# XState State Machines Instructions

- use **XState v5** 
- `machine.ts` must be **pure and portable**, it contains no React, Redux, or navigation imports;
- All side-effects (navigation, Redux dispatch, toasts) are injected via the provider.
- Use `createActorContext` from `@xstate/react` to expose the machine context to React.
- Use nexted states for complex flows with sub-steps
- Define fully-typed context with JSDoc comments and an initial state
- Define events as tagged union types with kebab-case type names
- Use absolute state IDs for cross-hierarchy transitions (e.g. `#myMachine.Failure`)

## File Structure

Complex multi-step flows (IT-Wallet issuance, identification, etc.) use **XState v5** with a strict file layout inside `machine/`:

- `machine.ts` — Pure `setup({...})` call — **no implementations**, uses `notImplemented` stubs
- `context.ts` — `Context` type + `InitialContext` constant
- `events.ts` — Discriminated union of all machine events
- `guards.ts` — Pure guard functions (no side-effects)
- `actions.ts` — `createXxxActionsImplementation(navigation, store, toast)` factory
- `actors.ts` — `fromPromise(...)` async actor factories
- `failure.ts` — Failure state/type mapping
- `selectors.ts` — Selectors scoped to machine context
- `provider.tsx` — `createActorContext` + `<MachineProvider>` component that wires implementations
- `tags.ts` — Enum of machine tags (e.g., `Loading`, `Issuing`)

## Reference Examples

- [idPayConfigurationMachine](./../ts/features/idpay/configuration/machine/) - IDPay Configuration with `fromCallback` actors
- [idPayOnboardingMachine](./../ts/features/idpay/onboarding/machine/) - IDPay Onboarding 
- [idPayPaymentMachine](./../ts/features/idpay/payment/machine/) - IDPay payment
- [itwCredentialIssuanceMachine](../../ts/features/itwallet/machine/credential/) - Credential issuance with nested states
- [itwEidIssuanceMachine](../../ts/features/itwallet/machine/eid/) - Complex flow with child machines
- [itwPresentationRemoteMachine](../../ts/features/itwallet/machine/presentation/remote/) - Remote presentation flow
