import { signOut } from '../sign-out';
import { clearAllData } from '../helper';

jest.mock('../helper', () => ({
  clearAllData: jest.fn(),
}));

describe('signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs the pre-reset callback before clearing authenticated state', async () => {
    const dispatch = jest.fn();
    const beforeReset = jest.fn();
    jest.mocked(clearAllData).mockResolvedValue(true);

    await expect(signOut(dispatch, beforeReset)).resolves.toBe(true);
    expect(beforeReset).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(beforeReset.mock.invocationCallOrder[0]).toBeLessThan(
      dispatch.mock.invocationCallOrder[0],
    );
  });

  it('does not reset authenticated state when local data cannot be cleared', async () => {
    const dispatch = jest.fn();
    const beforeReset = jest.fn();
    jest.mocked(clearAllData).mockResolvedValue(false);

    await expect(signOut(dispatch, beforeReset)).resolves.toBe(false);
    expect(beforeReset).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
