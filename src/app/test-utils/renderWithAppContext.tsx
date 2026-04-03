import React from 'react';
import { render } from '@testing-library/react-native';
import { AppContext } from '../AppContext';
import { initialContext } from '../../../types/SystemTypes';

export function renderWithAppContext(
  ui: React.ReactElement,
  overrides: Partial<typeof initialContext> = {}
) {
  const value = {
    ...initialContext,
    ...overrides,
    ideas: overrides.ideas ?? initialContext.ideas,
    canView: overrides.canView ?? initialContext.canView,
  };

  return render(<AppContext.Provider value={value}>{ui}</AppContext.Provider>);
}
