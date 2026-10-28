# Ziki #250 Handoff

## Goal

Prevent repeated taps and show visible progress while users log out or confirm account deletion in the Zedu mobile app.

## Deliverables

- [x] Logout spinner and disabled modal controls.
- [x] Account-deletion spinner and disabled confirmation controls.
- [x] Duplicate-action guards for both destructive flows.
- [x] Error notification and restored controls when local data clearing fails.
- [x] Unit/component regression coverage.
- [x] Pull request opened: https://github.com/zeduchat/zedu-mobile/pull/302.
- [x] Delivery evidence posted to Ziki #250 as comment `cmvs8t0660025pe014mu2b6mh`.

## Acceptance criteria

- Both destructive buttons show loading immediately.
- Repeated taps invoke local-data clearing once.
- Dismiss controls are disabled during the operation.
- Confirmation modals close before authenticated state is cleared.
- Failures leave the user signed in, restore controls, and show an error.
- Format, lint, and TypeScript commands complete successfully; all #250-focused Jest tests pass.

## Deadline

- Ziki claim delivery deadline: 2026-10-28 16:53 UTC.

## Scope

- Repository: `zedu-mobile`.
- Implementation base: `zedu-yodaa/zedu-mobile:dev`.
- Clean delivery base: `zeduchat/zedu-mobile:central-staging`, avoiding 60 unrelated files from the divergent source branch.
- User-directed PR base: `zeduchat/zedu-mobile:central-staging`.
- Backend account deletion is explicitly out of scope.
