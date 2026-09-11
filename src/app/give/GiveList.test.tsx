import React from 'react';
import { render } from '@testing-library/react-native';
import GiveList from './GiveList';
import { renderWithAppContext } from '../test-utils/renderWithAppContext';
import { AppContext } from '../AppContext';
import { initialContext } from '../../../types/SystemTypes';
import { ConnectionIdeas } from '../ideas/IdeasService';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    // Real useFocusEffect defers to after render and re-runs only when the
    // callback identity changes (react-navigation ties it to focus events;
    // GiveList's own useCallback ties that identity to activeConnections).
    // Calling the callback synchronously during render instead causes an
    // infinite re-render loop, since it sets state on every render.
    useFocusEffect: (callback: () => void | (() => void)) => useEffect(callback, [callback]),
  };
});

jest.mock('../connections/useConnections', () => ({
  useConnections: jest.fn(),
}));

jest.mock('../ideas/IdeasService', () => ({
  findIdeasForConnections: jest.fn(),
}));

const { useConnections } = jest.requireMock('../connections/useConnections') as {
  useConnections: jest.Mock<{ activeConnections: string[]; incomingRequests: never[]; outgoingRequests: never[]; isLoading: boolean }, [string | undefined]>;
};

const { findIdeasForConnections } = jest.requireMock('../ideas/IdeasService') as {
  findIdeasForConnections: jest.Mock<Promise<ConnectionIdeas[]>, [string[]]>;
};

function mockActiveConnections(activeConnections: string[]) {
  useConnections.mockReturnValue({
    activeConnections,
    incomingRequests: [],
    outgoingRequests: [],
    isLoading: false,
  });
}

const navigation = { navigate: jest.fn() };
const route = {};
const userInfo = { firstName: 'Tim', email: 'tim@example.com' };

const EMPTY_MESSAGE = 'No ideas from your connections yet.';

describe('GiveList', () => {
  beforeEach(() => {
    useConnections.mockReset();
    findIdeasForConnections.mockReset();
  });

  it('shows a connection\'s ideas grouped under their email (US1, FR-001, FR-003, FR-005)', async () => {
    mockActiveConnections(['friend1@example.com']);
    findIdeasForConnections.mockResolvedValue([
      {
        email: 'friend1@example.com',
        ideas: [
          { id: 'i1', title: 'Weekend Cabin Gift', description: 'Book a two-night cabin stay.' },
          { id: 'i2', title: 'Coffee Subscription', description: 'Three-month subscription.' },
        ],
      },
    ]);

    const { findByText } = renderWithAppContext(
      <GiveList route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(await findByText('friend1@example.com')).toBeTruthy();
    expect(await findByText('Weekend Cabin Gift')).toBeTruthy();
    expect(await findByText('Coffee Subscription')).toBeTruthy();
  });

  it('shows ideas from multiple connections at once, each under their own header (US1, FR-001, FR-003)', async () => {
    mockActiveConnections(['friend1@example.com', 'friend2@example.com']);
    findIdeasForConnections.mockResolvedValue([
      { email: 'friend1@example.com', ideas: [{ id: 'i1', title: 'Weekend Cabin Gift', description: '...' }] },
      { email: 'friend2@example.com', ideas: [{ id: 'i2', title: 'Board Game Set', description: '...' }] },
    ]);

    const { findByText } = renderWithAppContext(
      <GiveList route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(await findByText('friend1@example.com')).toBeTruthy();
    expect(await findByText('Weekend Cabin Gift')).toBeTruthy();
    expect(await findByText('friend2@example.com')).toBeTruthy();
    expect(await findByText('Board Game Set')).toBeTruthy();
  });

  it('never shows the signed-in user\'s own ideas (US1, FR-004)', async () => {
    mockActiveConnections(['friend1@example.com']);
    findIdeasForConnections.mockResolvedValue([
      { email: 'friend1@example.com', ideas: [{ id: 'i1', title: 'Weekend Cabin Gift', description: '...' }] },
    ]);

    const { findByText, queryByText } = renderWithAppContext(
      <GiveList route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(await findByText('Weekend Cabin Gift')).toBeTruthy();
    expect(findIdeasForConnections).toHaveBeenCalledWith(['friend1@example.com']);
    expect(queryByText('My Private Idea')).toBeNull();
  });

  it('shows an empty-state message with 0 active connections (US2, FR-006)', async () => {
    mockActiveConnections([]);
    findIdeasForConnections.mockResolvedValue([]);

    const { findByText, queryByText } = renderWithAppContext(
      <GiveList route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(await findByText(EMPTY_MESSAGE)).toBeTruthy();
    expect(queryByText('@')).toBeNull();
  });

  it('shows an empty-state message when active connections have no ideas (US2, FR-006)', async () => {
    mockActiveConnections(['friend1@example.com']);
    findIdeasForConnections.mockResolvedValue([{ email: 'friend1@example.com', ideas: [] }]);

    const { findByText, queryByText } = renderWithAppContext(
      <GiveList route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(await findByText(EMPTY_MESSAGE)).toBeTruthy();
    expect(queryByText('friend1@example.com')).toBeNull();
  });

  it('shows neither the list nor the empty-state message while still loading (US3, FR-007)', () => {
    mockActiveConnections(['friend1@example.com']);
    findIdeasForConnections.mockReturnValue(new Promise(() => {}));

    const { queryByText } = renderWithAppContext(
      <GiveList route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(queryByText(EMPTY_MESSAGE)).toBeNull();
    expect(queryByText('friend1@example.com')).toBeNull();
  });

  it('fails soft: shows ideas from connections that loaded, omits the one that failed, with no error message (US3, FR-009, SC-006)', async () => {
    mockActiveConnections(['friend1@example.com', 'friend2@example.com']);
    findIdeasForConnections.mockResolvedValue([
      { email: 'friend1@example.com', ideas: [{ id: 'i1', title: 'Weekend Cabin Gift', description: '...' }] },
      { email: 'friend2@example.com', ideas: [] },
    ]);

    const { findByText, queryByText } = renderWithAppContext(
      <GiveList route={route} navigation={navigation} />,
      { userInfo }
    );

    expect(await findByText('Weekend Cabin Gift')).toBeTruthy();
    expect(await findByText('friend1@example.com')).toBeTruthy();
    expect(queryByText('friend2@example.com')).toBeNull();
    expect(queryByText(/error/i)).toBeNull();
  });

  it('hides the prompt live when a connection with an idea is accepted, without remounting (US3, FR-008)', async () => {
    mockActiveConnections([]);
    findIdeasForConnections.mockResolvedValue([]);

    const wrap = () => (
      <AppContext.Provider value={{ ...initialContext, userInfo }}>
        <GiveList route={route} navigation={navigation} />
      </AppContext.Provider>
    );

    const { findByText, queryByText, rerender } = render(wrap());

    expect(await findByText(EMPTY_MESSAGE)).toBeTruthy();

    mockActiveConnections(['friend1@example.com']);
    findIdeasForConnections.mockResolvedValue([
      { email: 'friend1@example.com', ideas: [{ id: 'i1', title: 'Weekend Cabin Gift', description: '...' }] },
    ]);
    rerender(wrap());

    expect(await findByText('Weekend Cabin Gift')).toBeTruthy();
    expect(queryByText(EMPTY_MESSAGE)).toBeNull();
  });

  it('shows the empty state again live when the only connection is removed, without remounting (US3, FR-008)', async () => {
    mockActiveConnections(['friend1@example.com']);
    findIdeasForConnections.mockResolvedValue([
      { email: 'friend1@example.com', ideas: [{ id: 'i1', title: 'Weekend Cabin Gift', description: '...' }] },
    ]);

    const wrap = () => (
      <AppContext.Provider value={{ ...initialContext, userInfo }}>
        <GiveList route={route} navigation={navigation} />
      </AppContext.Provider>
    );

    const { findByText, queryByText, rerender } = render(wrap());

    expect(await findByText('Weekend Cabin Gift')).toBeTruthy();

    mockActiveConnections([]);
    findIdeasForConnections.mockResolvedValue([]);
    rerender(wrap());

    expect(await findByText(EMPTY_MESSAGE)).toBeTruthy();
    expect(queryByText('Weekend Cabin Gift')).toBeNull();
  });
});
