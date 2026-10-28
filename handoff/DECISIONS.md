# Decisions

## Use the mobile repository

- The issue named `src/screens/settings/delete-account.tsx`, which exists in `zedu-mobile` and not `zedu-fe`.
- Work moved to the mobile repository after confirming this with the user.

## Keep backend deletion out of scope

- The issue says the missing backend deletion request is tracked separately.
- This change improves progress and failure feedback around the existing local logout behavior only.

## Return a boolean from `clearAllData`

- Existing callers can continue ignoring the return value.
- The two destructive UI flows can now avoid clearing app state when AsyncStorage fails.

## Guard with refs as well as disabled UI

- State-driven disabled props protect normal interaction.
- `useRef` guards also prevent duplicate work when two taps arrive before React re-renders.

## PR target override

- Repository guidance normally targets `zedu-hng:dev`.
- The user directly instructed this PR to target `zeduchat/zedu-mobile:central-staging`; this may require retargeting if repository policy rejects it.

## Use a clean target-based delivery branch

- A direct PR from `zedu-yodaa:dev` would include 60 unrelated files and protected workflow changes because the branches have diverged.
- The original implementation branch remains intact, while the delivery branch cherry-picks only #250 work onto `zeduchat:central-staging`.

## Preserve the target branch's sign-out architecture

- `central-staging` centralizes session reset in `src/utils/sign-out.ts` and already calls the account-deletion backend.
- The delivery implementation extends that helper with a success result and pre-reset callback rather than duplicating dispatch logic in both screens.

## Never repeat backend deletion after partial success

- If account deletion succeeds but local sign-out fails, the next tap retries only local sign-out.
- The error explicitly says the account was deleted and recommends restarting, instead of incorrectly claiming deletion failed.
