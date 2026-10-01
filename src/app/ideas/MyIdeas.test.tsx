import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import MyIdeas from './MyIdeas';
import { renderWithAppContext } from '../test-utils/renderWithAppContext';

jest.mock('./IdeasService', () => ({
  findAllIdeas: jest.fn().mockResolvedValue([
    {
      id: 'idea-001',
      title: 'Weekend Cabin Gift',
      description: 'Book a two-night cabin stay with hiking nearby.',
    },
  ]),
  deleteIdea: jest.fn(),
}));

jest.mock('../util/FirebaseUtils', () => ({
  FirebaseUtils: {
    getFirestoreDatabase: jest.fn(),
  },
}));

jest.mock('../shared/SwipeableItem', () => ({
  SwipeToDelete: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../connections/useConnections', () => ({
  useConnections: jest.fn().mockReturnValue({
    activeConnections: ['friend1@example.com'],
    incomingRequests: [],
    outgoingRequests: [],
    isLoading: false,
  }),
}));

jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: (callback: () => void | (() => void)) => useEffect(callback, [callback]),
  };
});

const { findAllIdeas } = jest.requireMock('./IdeasService') as {
  findAllIdeas: jest.Mock;
};

describe('MyIdeas', () => {
  it('loads and displays ideas, then navigates to AddIdea from the add button', async () => {
    const navigation = { navigate: jest.fn() };
    const route = {};

    const { getByLabelText, findByText } = renderWithAppContext(
      <MyIdeas route={route} navigation={navigation} />,
      {
        userInfo: {
          firstName: 'Tim',
          email: 'tim@example.com',
        },
        ideas: [],
      }
    );

    await waitFor(() => {
      expect(findAllIdeas).toHaveBeenCalledWith('tim@example.com');
    });

    expect(await findByText('Weekend Cabin Gift')).toBeTruthy();

    expect(await findByText('Book a two-night cabin stay with hiking nearby.')).toBeTruthy();
    expect(await findByText('Visible to your 1 friend')).toBeTruthy();

    fireEvent.press(getByLabelText('Add an idea'));
    expect(navigation.navigate).toHaveBeenCalledWith('AddIdea');
  });
});
