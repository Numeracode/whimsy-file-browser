import { render } from '@testing-library/react';
import React from 'react';
import { ChonkyIconName } from '@numeracode/whimsy-file-browser';
import { ChonkyIconFA } from '../src';

describe('ChonkyIconFA', () => {
  it('renders without crashing', () => {
    render(<ChonkyIconFA icon={ChonkyIconName.file} />);
  });
});
