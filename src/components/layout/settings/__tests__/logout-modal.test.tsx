import React from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import LogoutConfirmationModal from '../logout-modal';
import { signOut } from '@/utils/sign-out';
import { ShowNotify } from '@/components/ui/toast';

const mockDispatch = jest.fn();

jest.mock('@/components/ui/text', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return {
    AppText: ({ children, ...props }: any) =>
      ReactModule.createElement(Text, props, children),
  };
});

jest.mock('@/utils/sign-out', () => ({
  signOut: jest.fn(),
}));

jest.mock('@/store/useDataContext', () => ({
  useDataContext: () => ({ dispatch: mockDispatch }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({}),
}));

jest.mock('@/theme/ThemeProvider', () => ({
  useTheme: () => ({ colors: { white: '#fff' } }),
}));

jest.mock('@/theme/createChatOverlayStyles', () => ({
  createLogoutModalStyles: () => ({
    overlay: {},
    modalContainer: {},
    title: {},
    message: {},
    buttonContainer: {},
    cancelButton: {},
    cancelText: {},
    logoutButton: {},
    logoutText: {},
  }),
}));

jest.mock('@/components/ui/toast', () => ({
  ShowNotify: jest.fn(),
}));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(resolver => {
    resolve = resolver;
  });
  return { promise, resolve };
};

const renderModal = (onClose = jest.fn()) => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <LogoutConfirmationModal visible onClose={onClose} />,
    );
  });
  return { renderer, onClose };
};

describe('LogoutConfirmationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables both actions, shows a spinner, and ignores repeated logout taps', async () => {
    const pending = deferred<boolean>();
    jest.mocked(signOut).mockReturnValue(pending.promise);
    const { renderer } = renderModal();
    const logout = renderer.root.findAllByType(TouchableOpacity)[1];
    let logoutPromise!: Promise<void>;

    await act(async () => {
      logoutPromise = logout.props.onPress();
      await Promise.resolve();
    });

    const [cancelButton, logoutButton] =
      renderer.root.findAllByType(TouchableOpacity);
    expect(cancelButton.props.disabled).toBe(true);
    expect(logoutButton.props.disabled).toBe(true);
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);

    await act(async () => {
      logoutButton.props.onPress();
      await Promise.resolve();
    });
    expect(signOut).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve(true);
      await logoutPromise;
    });
  });

  it('closes before clearing authenticated state after a successful logout', async () => {
    (signOut as jest.Mock).mockImplementation(
      async (logoutDispatch: jest.Mock, beforeReset?: () => void) => {
        beforeReset?.();
        logoutDispatch({ type: 'RESET_STATE' });
        return true;
      },
    );
    const { renderer, onClose } = renderModal();

    await act(async () => {
      await renderer.root.findAllByType(TouchableOpacity)[1].props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalled();
    expect(onClose.mock.invocationCallOrder[0]).toBeLessThan(
      mockDispatch.mock.invocationCallOrder[0],
    );
  });

  it('restores the actions and notifies the user when logout fails', async () => {
    jest.mocked(signOut).mockResolvedValue(false);
    const { renderer, onClose } = renderModal();

    await act(async () => {
      await renderer.root.findAllByType(TouchableOpacity)[1].props.onPress();
    });

    const [cancelButton, logoutButton] =
      renderer.root.findAllByType(TouchableOpacity);
    expect(cancelButton.props.disabled).toBe(false);
    expect(logoutButton.props.disabled).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(ShowNotify).toHaveBeenCalledWith(
      'Error',
      'Unable to log out. Please try again.',
    );
  });
});
