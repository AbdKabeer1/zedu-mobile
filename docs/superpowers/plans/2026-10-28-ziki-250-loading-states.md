# Ziki #250 Loading States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible, non-repeatable loading states and recoverable error feedback to mobile logout and account-deletion actions.

**Architecture:** Keep state local to the two existing UI components. Extend `clearAllData` with a backward-compatible boolean result, then let each component guard concurrent execution with a ref, render its existing spinner path, close on success, and notify on failure.

**Tech Stack:** React Native 0.83, React 19, TypeScript, Jest, `react-test-renderer`, AsyncStorage.

**Spec:** `docs/superpowers/specs/2026-10-28-ziki-250-loading-states-design.md`

## Global Constraints

- Do not add the separately tracked backend account-deletion request.
- Do not add dependencies or modify native/config/protected files.
- Preserve existing navigation and authenticated-state dispatches.
- Use `ShowNotify` for user-visible failures and existing loading components for progress.
- Target both Android and iPhone behavior.

## Review Focus

- A second tap before React re-renders must not start another destructive operation.
- A failed AsyncStorage clear must leave the user signed in, restore controls, and show an error.
- Modal dismiss controls must not interrupt an operation after it starts.
- Successful logout must close the modal before authenticated state is cleared.
- Existing callers that ignore `clearAllData`'s return value must continue to work.

---

### Task 1: Observable local-data clearing

**Files:**
- Modify: `src/utils/helper.ts:66-72`
- Create: `src/utils/__tests__/helper.test.ts`

**Interfaces:**
- Produces: `clearAllData(): Promise<boolean>`; `true` after `AsyncStorage.clear`, `false` after a caught error.

- [ ] **Step 1: Write the failing utility tests**

Add tests that assert `clearAllData()` returns `true` when AsyncStorage resolves and `false` when it rejects.

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- src/utils/__tests__/helper.test.ts --runInBand`

Expected: FAIL because the current helper resolves `undefined` in both branches.

- [ ] **Step 3: Implement the boolean result**

Return `true` after a successful clear and `false` from the existing catch block, preserving its diagnostic log.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `npm test -- src/utils/__tests__/helper.test.ts --runInBand`

Expected: 2 tests pass.

### Task 2: Safe logout modal state

**Files:**
- Modify: `src/components/layout/settings/logout-modal.tsx:1-92`
- Create: `src/components/layout/settings/__tests__/logout-modal.test.tsx`

**Interfaces:**
- Consumes: `clearAllData(): Promise<boolean>` from Task 1.
- Produces: guarded `logout(): Promise<void>` behavior inside `LogoutConfirmationModal`.

- [ ] **Step 1: Write failing component tests**

Cover: spinner visibility while clearing is pending; both buttons disabled; duplicate presses call clear once; success calls `onClose` before auth-state dispatches; failure restores controls and calls `ShowNotify('Error', ...)` without dispatching logout state.

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- src/components/layout/settings/__tests__/logout-modal.test.tsx --runInBand`

Expected: FAIL because Cancel remains enabled, duplicate presses are unguarded, the modal never closes, and failures are only logged.

- [ ] **Step 3: Implement guarded logout behavior**

Add a `useRef(false)` in-flight guard, disable every dismiss/action path while loading, check the Task 1 result, call `onClose()` before auth-state dispatches, and show an error notification on failure.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `npm test -- src/components/layout/settings/__tests__/logout-modal.test.tsx --runInBand`

Expected: all logout modal tests pass.

### Task 3: Safe account-deletion confirmation state

**Files:**
- Modify: `src/screens/settings/delete-account.tsx:151-187,293-330`
- Create: `src/screens/settings/__tests__/delete-account.test.tsx`

**Interfaces:**
- Consumes: `clearAllData(): Promise<boolean>` from Task 1.
- Produces: guarded `logout(): Promise<void>` behavior inside `DeleteAccountScreen` using `isDeleting` as the rendered loading source.

- [ ] **Step 1: Write failing component tests**

Cover: Delete Permanently enters loading immediately; all confirmation dismiss paths disable; duplicate presses clear once; success closes the modal before logout dispatches; failure restores the modal controls and calls `ShowNotify('Error', ...)` without logout dispatches.

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm test -- src/screens/settings/__tests__/delete-account.test.tsx --runInBand`

Expected: FAIL because the `isDeleting` setter is discarded and repeated presses are unguarded.

- [ ] **Step 3: Implement guarded deletion behavior**

Use the real `setIsDeleting`, add a `useRef(false)` guard, remove the unused loading state, disable confirmation dismiss controls while running, check the clear result, close on success, and notify on failure.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `npm test -- src/screens/settings/__tests__/delete-account.test.tsx --runInBand`

Expected: all deletion tests pass.

### Task 4: Full verification and delivery

**Files:**
- Create or update: `handoff/README.md`, `handoff/STATUS.md`, `handoff/DECISIONS.md`, `handoff/RUNBOOK.md`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: a verified branch, PR, and Ziki PR linkage.

- [ ] **Step 1: Run focused and full verification**

Run: `npm run check-format && npm run check-lint && npm run check-types && npm test -- --runInBand`

Expected: zero command failures; pre-existing lint warnings may remain but no new warnings in touched files.

- [ ] **Step 2: Review the diff and protected-file policy**

Run: `git diff --check && git status --short` and confirm only scoped source, tests, docs, and handoff files changed.

- [ ] **Step 3: Commit and push**

Commit: `fix: add loading states to destructive account actions`

Push the ticket branch to the authenticated contributor fork without force.

- [ ] **Step 4: Open and verify the PR**

Open a fully completed PR into `zeduchat/zedu-mobile:central-staging`, confirm its checks, and capture the canonical PR URL.

- [ ] **Step 5: Link the verified PR to Ziki #250**

POST the canonical URL to `/api/v1/issues/{id}/github` while the claim is active, then GET #250 to verify `pullRequestUrl` matches.
