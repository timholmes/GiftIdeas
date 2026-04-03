import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AddIdea } from './AddIdea';
import { renderWithAppContext } from '../test-utils/renderWithAppContext';

jest.mock('react-native-paper', () => ({
  Button: ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => {
    const React = require('react');
    const { Text, TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  },
  Text: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
  TextInput: ({ value, onChangeText }: { value: string; onChangeText: (value: string) => void }) => {
    const React = require('react');
    const { TextInput } = require('react-native');
    return <TextInput value={value} onChangeText={onChangeText} />;
  },
  Portal: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
  Snackbar: ({ children }: { children: React.ReactNode }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
}));

jest.mock('./IdeasService', () => ({
  createIdea: jest.fn().mockResolvedValue({ id: 'idea-new-001' }),
}));

const { createIdea } = jest.requireMock('./IdeasService') as {
  createIdea: jest.Mock;
};

describe('AddIdea', () => {
  it('submits idea values and navigates back to MyIdeas', async () => {
    const navigation = { navigate: jest.fn() };
    const route = {
      params: {
        idea: {
          id: 'idea-001',
          title: 'Weekend Cabin Gift',
          description: 'Book a two-night cabin stay with hiking nearby.',
        },
      },
    };

    const { getByText } = renderWithAppContext(
      <AddIdea route={route} navigation={navigation} />,
      {
        userInfo: {
          firstName: 'Tim',
          email: 'tim@example.com',
        },
        ideas: [],
      }
    );

    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(createIdea).toHaveBeenCalledWith(
        'tim@example.com',
        expect.objectContaining({
          title: 'Weekend Cabin Gift',
          description: 'Book a two-night cabin stay with hiking nearby.',
        })
      );
      expect(navigation.navigate).toHaveBeenCalledWith('MyIdeas', {
        refreshContent: true,
      });
    });
  });
});
