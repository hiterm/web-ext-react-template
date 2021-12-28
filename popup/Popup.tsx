import React, { useEffect, useState } from 'react';
import * as browser from 'webextension-polyfill';

export const Popup: React.VFC = () => {

  const [titles, setTitles] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    (
      async () => {
        setTitles((await browser.tabs.query({})).map(tab => tab.title!));
      })();
  }, []);

  if (titles == null) {
    return <div>Loading...</div>;
  }

  return (<ul>{titles.map(title => <li key={title}>{title}</li>)}</ul>);
}
