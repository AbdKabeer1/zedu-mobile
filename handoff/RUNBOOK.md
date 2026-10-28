# Runbook

## Setup

```bash
cd /Users/mrroddy/.local/share/opencode/worktree/714590/ziki-250-mobile-loading-states
npm ci
```

## Focused tests

```bash
npm test -- src/utils/__tests__/helper.test.ts --runInBand
npm test -- src/components/layout/settings/__tests__/logout-modal.test.tsx --runInBand
npm test -- src/screens/settings/__tests__/delete-account.test.tsx --runInBand
npm test -- __tests__/sign-out.test.ts --runInBand
```

## Full verification

```bash
npm run check-format
npm run check-lint
npm run check-types
npm test -- --runInBand
git diff --check
```

The target branch's full Jest suite currently has pre-existing native-module setup failures because `jest.config.js` does not load a setup file. The focused #250 command is:

```bash
npm test -- \
  src/utils/__tests__/helper.test.ts \
  src/utils/__tests__/sign-out.test.ts \
  __tests__/sign-out.test.ts \
  src/components/layout/settings/__tests__/logout-modal.test.tsx \
  src/screens/settings/__tests__/delete-account.test.tsx \
  --runInBand
```

## Manual verification

On both Android and iPhone:

1. Open Settings → Sign out and tap Log Out twice quickly.
2. Confirm one spinner appears, both actions disable, and the modal closes before navigation.
3. Open Settings → Delete Account, select a reason, and continue.
4. Tap Delete Permanently twice quickly.
5. Confirm one spinner appears and every confirmation dismiss action disables.
6. Simulate AsyncStorage failure in a debug build and confirm controls restore with an error notification.

## Delivery

```bash
git push -u origin fix/ziki-250-loading-states-central
gh pr create \
  --repo zeduchat/zedu-mobile \
  --base central-staging \
  --head AbdKabeer1:fix/ziki-250-loading-states-central
```
