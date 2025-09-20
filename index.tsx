/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Fix: Import React, ReactDOM, and the App component.
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { App } from './src/App.tsx';

const container = document.getElementById('app');
if (container) {
    // Fix: createRoot is available on the imported ReactDOM object.
    const root = ReactDOM.createRoot(container);
    // Fix: Use JSX syntax for rendering the App component.
    root.render(<App />);
}