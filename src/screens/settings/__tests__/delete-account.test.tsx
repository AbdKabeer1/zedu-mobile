import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import DeleteAccountScreen from '../delete-account';
import { AppButton } from '@/components/ui/button';
import { DeleteRequest } from '@/utils/requests';
import { signOut } from '@/utils/sign-out';
import { ShowNotify } from '@/components/ui/toast';

const mockDispatch = jest.fn();
const TestableDeleteAccountScreen = DeleteAccountScreen as React.ComponentType<{
  navigation: { goBack: jest.Mock };
}>;

jest.mock('@/components/ui/text', () => {
  const ReactModule = require('react');
  const { Text } = require('react-native');
  return {
    AppText: ({ children, ...props }: any) =>
      ReactModule.createElement(Text, props, children),
  };
});

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return (props: any) => ReactModule.createElement(View, props);
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const ReactModule = require('react');
  const { View } = require('react-native');
  return (props: any) => ReactModule.createElement(View, props);
});

jest.mock('@/utils/requests', () => ({
  DeleteRequest: jest.fn(),
}));

jest.mock('@/utils/sign-out', () => ({
  signOut: jest.fn(),
}));

jest.mock('@/store/useDataContext', () => ({
  useDataContext: () => ({ dispatch: mockDispatch }),
}));

jest.mock('@/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff',
      surface: '#fff',
      surfaceElevated: '#eee',
      textPrimary: '#111',
      textSecondary: '#666',
      border: '#ddd',
      primary: '#00f',
      error: '#f00',
      iconMuted: '#999',
      transparent: 'transparent',
      white: '#fff',
    },
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

const renderDeleteAccount = () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <TestableDeleteAccountScreen navigation={{ goBack: jest.fn() }} />,
    );
  });
  return renderer;
};

const openConfirmation = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
) => {
  await act(async () => {
    renderer.root.findAllByType(TouchableOpacity)[0].props.onPress();
  });
  const continueButton = renderer.root
    .findAllByType(AppButton)
    .find(button => button.props.title === 'Continue to Delete');
  await act(async () => {
    continueButton?.props.onPress();
  });
};

const permanentDeleteButton = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root
    .findAllByType(AppButton)
    .find(button => button.props.title === 'Delete Permanently')!;

describe('DeleteAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(signOut).mockResolvedValue(true);
  });

  it('shows deletion progress, disables dismiss actions, and ignores repeated taps', async () => {
    const pending = deferred<{ data: object; error: null }>();
    jest.mocked(DeleteRequest).mockReturnValue(pending.promise);
    const renderer = renderDeleteAccount();
    await openConfirmation(renderer);
    let deletePromise!: Promise<void>;

    await act(async () => {
      deletePromise = permanentDeleteButton(renderer).props.onPress();
      await Promise.resolve();
    });

    expect(permanentDeleteButton(renderer).props.loading).toBe(true);
    const modalDismissActions = renderer.root
      .findByType(Modal)
      .findAllByType(TouchableOpacity);
    expect(modalDismissActions).toHaveLength(3);
    expect(modalDismissActions.every(action => action.props.disabled)).toBe(
      true,
    );

    await act(async () => {
      permanentDeleteButton(renderer).props.onPress();
      await Promise.resolve();
    });
    expect(DeleteRequest).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve({ data: {}, error: null });
      await deletePromise;
    });
  });

  it('dismisses the confirmation before clearing authenticated state', async () => {
    jest.mocked(DeleteRequest).mockResolvedValue({ data: {}, error: null });
    (signOut as jest.Mock).mockImplementation(
      async (logoutDispatch: jest.Mock, beforeReset?: () => void) => {
        beforeReset?.();
        logoutDispatch({ type: 'RESET_STATE' });
        return true;
      },
    );
    const renderer = renderDeleteAccount();
    await openConfirmation(renderer);

    await act(async () => {
      await permanentDeleteButton(renderer).props.onPress();
    });

    expect(renderer.root.findByType(Modal).props.visible).toBe(false);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('restores confirmation controls and notifies the user when deletion fails', async () => {
    jest.mocked(DeleteRequest).mockResolvedValue({ data: {}, error: null });
    jest.mocked(signOut).mockResolvedValue(false);
    const renderer = renderDeleteAccount();
    await openConfirmation(renderer);

    await act(async () => {
      await permanentDeleteButton(renderer).props.onPress();
    });

    expect(renderer.root.findByType(Modal).props.visible).toBe(true);
    expect(permanentDeleteButton(renderer).props.loading).toBe(false);
    expect(
      renderer.root
        .findByType(Modal)
        .findAllByType(TouchableOpacity)
        .every(action => action.props.disabled === false),
    ).toBe(true);
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(ShowNotify).toHaveBeenCalledWith(
      'Error',
      'Unable to delete your account. Please try again.',
    );
  });
});
