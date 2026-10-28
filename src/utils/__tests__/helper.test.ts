import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAllData } from '../helper';

describe('clearAllData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true after clearing local data', async () => {
    jest.mocked(AsyncStorage.clear).mockResolvedValue(undefined);

    await expect(clearAllData()).resolves.toBe(true);
    expect(AsyncStorage.clear).toHaveBeenCalledTimes(1);
  });

  it('returns false when clearing local data fails', async () => {
    const error = new Error('storage unavailable');
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    jest.mocked(AsyncStorage.clear).mockRejectedValue(error);

    await expect(clearAllData()).resolves.toBe(false);
    expect(consoleError).toHaveBeenCalledWith(
      'Error clearing local storage:',
      error,
    );

    consoleError.mockRestore();
  });
});
