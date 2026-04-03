import React from 'react';
import { DeviceEventEmitter } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import SignInStub from './SignInStub';
import { renderWithAppContext } from '../test-utils/renderWithAppContext';

jest.mock('../util/FirebaseUtils', () => ({
  FirebaseUtils: {
    stubSignIn: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('SignInStub', () => {
  it('renders seeded users and emits sign-in success for Tim', async () => {
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit');

    const { getByText } = renderWithAppContext(<SignInStub />);

    expect(getByText('Tim')).toBeTruthy();
    expect(getByText('Alex')).toBeTruthy();

    fireEvent.press(getByText('Tim'));

    await waitFor(() => {
      expect(emitSpy).toHaveBeenCalledWith(
        'event.onSignIn',
        expect.objectContaining({
          success: true,
          userInfo: expect.objectContaining({ email: 'tim@example.com' }),
        })
      );
    });

    emitSpy.mockRestore();
  });
});
