import React from 'react';
import { render } from '@testing-library/react-native';
import Home from './Home';
import { renderWithAppContext } from './test-utils/renderWithAppContext';
import { AppContext } from './AppContext';
import { initialContext } from '../../types/SystemTypes';
import { UseConnectionsResult } from './connections/useConnections';

jest.mock('react-native-paper', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return {
    Button: ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => (
      <TouchableOpacity onPress={onPress}>
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('./connections/useConnections', () => ({
  useConnections: jest.fn(),
}));

const { useConnections } = jest.requireMock('./connections/useConnections') as {
  useConnections: jest.Mock<UseConnectionsResult, [string | undefined]>;
};

function mockConnections(overrides: Partial<UseConnectionsResult>) {
  useConnections.mockReturnValue({
    activeConnections: [],
    incomingRequests: [],
    outgoingRequests: [],
    isLoading: false,
    ...overrides,
  });
}

const navigation = { navigate: jest.fn() };
const route = {};
const userInfo = { firstName: 'Tim', email: 'tim@example.com' };

const INVITE_MESSAGE = 'To invite someone to your ideas, click below.';

describe('Home', () => {
  beforeEach(() => {
    useConnections.mockReset();
  });

  it('shows the invite prompt while the connection count is still loading (US3, FR-006)', () => {
    mockConnections({ isLoading: true, activeConnections: [] });

    const { getByText } = renderWithAppContext(
      <Home route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(getByText(INVITE_MESSAGE)).toBeTruthy();
    expect(getByText('Add')).toBeTruthy();
  });

  it('shows the invite prompt with 0 active connections (US2, FR-001)', () => {
    mockConnections({ isLoading: false, activeConnections: [] });

    const { getByText } = renderWithAppContext(
      <Home route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(getByText(INVITE_MESSAGE)).toBeTruthy();
    expect(getByText('Add')).toBeTruthy();
  });

  it('shows the invite prompt with exactly 1 active connection (US2, FR-001)', () => {
    mockConnections({ isLoading: false, activeConnections: ['b@example.com'] });

    const { getByText } = renderWithAppContext(
      <Home route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(getByText(INVITE_MESSAGE)).toBeTruthy();
    expect(getByText('Add')).toBeTruthy();
  });

  it('hides the invite prompt with 2 active connections (US1, FR-002)', () => {
    mockConnections({
      isLoading: false,
      activeConnections: ['b@example.com', 'c@example.com'],
    });

    const { queryByText } = renderWithAppContext(
      <Home route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(queryByText(INVITE_MESSAGE)).toBeNull();
    expect(queryByText('Add')).toBeNull();
  });

  it('hides the invite prompt with 3+ active connections (US1, FR-002)', () => {
    mockConnections({
      isLoading: false,
      activeConnections: ['b@example.com', 'c@example.com', 'd@example.com'],
    });

    const { queryByText } = renderWithAppContext(
      <Home route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(queryByText(INVITE_MESSAGE)).toBeNull();
    expect(queryByText('Add')).toBeNull();
  });

  it('leaves the welcome message visible when the invite prompt is hidden (FR-005)', () => {
    mockConnections({
      isLoading: false,
      activeConnections: ['b@example.com', 'c@example.com'],
    });

    const { getByText } = renderWithAppContext(
      <Home route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(getByText(/Welcome, Tim\./)).toBeTruthy();
  });

  it('hides the prompt live when active connections cross from 1 to 2 without remounting (US3, FR-004)', () => {
    mockConnections({ isLoading: false, activeConnections: ['b@example.com'] });

    // Rendered via a fixed AppContext.Provider wrapper (rather than
    // renderWithAppContext) so `rerender` updates the same root element type
    // instead of unmounting/remounting it, proving the visibility change is
    // a live update, not a fresh mount.
    const wrap = () => (
      <AppContext.Provider value={{ ...initialContext, userInfo }}>
        <Home route={route} navigation={navigation} />
      </AppContext.Provider>
    );

    const { getByText, queryByText, rerender } = render(wrap());

    expect(getByText(INVITE_MESSAGE)).toBeTruthy();

    mockConnections({
      isLoading: false,
      activeConnections: ['b@example.com', 'c@example.com'],
    });
    rerender(wrap());

    expect(queryByText(INVITE_MESSAGE)).toBeNull();
  });

  it('shows the prompt again live when active connections drop from 2 to 1 without remounting (US3, FR-004)', () => {
    mockConnections({
      isLoading: false,
      activeConnections: ['b@example.com', 'c@example.com'],
    });

    const wrap = () => (
      <AppContext.Provider value={{ ...initialContext, userInfo }}>
        <Home route={route} navigation={navigation} />
      </AppContext.Provider>
    );

    const { getByText, queryByText, rerender } = render(wrap());

    expect(queryByText(INVITE_MESSAGE)).toBeNull();

    mockConnections({ isLoading: false, activeConnections: ['b@example.com'] });
    rerender(wrap());

    expect(getByText(INVITE_MESSAGE)).toBeTruthy();
  });
});
