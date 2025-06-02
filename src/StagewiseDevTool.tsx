import React from 'react';
import { Platform } from 'react-native';

const stagewiseConfig = {
  plugins: []
};

export const initializeStagewise = () => {
  if (process.env.NODE_ENV === 'development' && Platform.OS === 'web') {
    const { createRoot } = require('react-dom/client');
    const { StagewiseToolbar } = require('@stagewise/toolbar-react');

    const stagewiseToolbarId = 'stagewise-toolbar-root';
    let toolbarRootDiv = document.getElementById(stagewiseToolbarId);

    if (!toolbarRootDiv) {
      toolbarRootDiv = document.createElement('div');
      toolbarRootDiv.id = stagewiseToolbarId;
      document.body.appendChild(toolbarRootDiv);
    }

    const root = createRoot(toolbarRootDiv);
    root.render(
      <React.StrictMode>
        <StagewiseToolbar config={stagewiseConfig} />
      </React.StrictMode>
    );
  }
}; 