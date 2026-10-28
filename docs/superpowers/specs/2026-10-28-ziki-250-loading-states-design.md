# Ziki #250 Loading States Design

## Intent

Make destructive logout and account-deletion actions visibly responsive and safe from repeated taps on Android and iPhone.

## Scope

- `src/components/layout/settings/logout-modal.tsx`
  - Immediately show a spinner when logout starts.
  - Disable both Log Out and Cancel while the operation is running.
  - Ignore repeated logout taps.
  - Close the modal before clearing authenticated app state.
  - Restore the idle state and show an error notification if local data cannot be cleared.
- `src/screens/settings/delete-account.tsx`
  - Immediately show the existing `AppButton` loading indicator when Delete Permanently starts.
  - Disable Delete Permanently, the modal close action, and “I've changed my mind” while running.
  - Ignore repeated deletion taps.
  - Close the confirmation modal before clearing authenticated app state.
  - Restore the idle state and show an error notification if local data cannot be cleared.
- `src/utils/helper.ts`
  - Return whether `clearAllData` succeeded so callers can present failure feedback without breaking existing callers that ignore the return value.

## Non-goals

- Do not add the missing backend account-deletion request; the ticket explicitly tracks that separately.
- Do not redesign either modal or change unrelated settings behavior.
- Do not add dependencies or modify native projects.

## Verification

- Component tests cover pending, repeated-tap, success, and failure states.
- Utility tests cover successful and failed local-data clearing.
- Required format, lint, TypeScript, and Jest checks pass.
- Manual device verification remains required for final Android/iPhone acceptance.

## Delivery

- Implementation was first completed from `zedu-yodaa/zedu-mobile:dev`.
- Because that branch diverges from the requested PR target by 60 unrelated files, the delivery branch is based on `zeduchat/zedu-mobile:central-staging` and contains only the tested #250 commits.
- Push branch to the authenticated contributor fork.
- Per the user's direct instruction, open the PR against `zeduchat/zedu-mobile:central-staging`.
- Link the final PR to Ziki issue #250 only after checks pass.
