import { render } from '@testing-library/react';
import React from 'react';
import { ChonkyIconName } from 'chonky';
import { ChonkyIconFA } from '../src';

describe('ChonkyIconFA', () => {
  it('renders without crashing', () => {
    render(<ChonkyIconFA icon={ChonkyIconName.file} />);
  });
});
