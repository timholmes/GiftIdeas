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
  SwipeableItemEvents: {
    DELETE_PRESS: 'event.delete',
    ITEM_PRESS: 'event.press',
  },
  SwipeableItem: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{title}</Text>;
  },
}));

jest.mock('react-native-paper', () => {
  const React = require('react');
  const { Text, TouchableOpacity } = require('react-native');
  return {
    AnimatedFAB: ({ onPress }: { onPress: () => void }) => (
      <TouchableOpacity onPress={onPress}>
        <Text>Open AddIdea</Text>
      </TouchableOpacity>
    ),
  };
});

const { findAllIdeas } = jest.requireMock('./IdeasService') as {
  findAllIdeas: jest.Mock;
};

describe('MyIdeas', () => {
  it('loads and displays ideas, then navigates to AddIdea from FAB', async () => {
    const navigation = { navigate: jest.fn() };
    const route = {};

    const { getByText, findByText } = renderWithAppContext(
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

    fireEvent.press(getByText('Open AddIdea'));
    expect(navigation.navigate).toHaveBeenCalledWith('AddIdea');
  });
});
