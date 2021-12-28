import React from 'react';
import browser from 'webextension-polyfill';

export const Popup: React.VFC = () => {
  const handleClick = () => {
    browser.tabs.create({ url: 'https://example.com/' });
  };

  // a button to open example.com
  return <button onClick={handleClick}>Button</button>;
};
