# React hooks for Mobiledoc

## Install

```bash
yarn add react-mobiledoc-hooks

#or

npm install react-mobiledoc-hooks
```

## Usage

### The `useMobiledoc` hook

Given a `mobiledoc` document, it outputs a React list of its sections.

```jsx
// RichText.js

import React from 'react'
import { useMobiledoc } from 'react-mobiledoc-hooks'

// Read more bellow in "Customization"
const configuration = {
  atoms: [],
  cards: [],
  markups: [],
  sections: [],
  additionalProps: [],
}

function RichText({ doc, ...props }) {
  const output = useMobiledoc(doc, configuration)

  return (
    <div className="richtext" {...props}>
      {output}
    </div>
  )
}

// App.js

import React from 'react'
import RichText from './RichText'

const mobiledoc = {
  version: '0.3.1',
  atoms: [],
  cards: [],
  markups: [['strong']],
  sections: [
    [
      1,
      'p',
      [
        [0, [], 0, 'This is a '],
        [0, [0], 1, 'useMobiledoc'],
        [0, [], 0, ' demp'],
      ],
    ],
  ],
}

function App() {
  return <RichText doc={mobiledoc} />
}
```

The output should look like this:

> This is a **useMobiledoc** demo

#### Customization

The second argument in `useMobiledoc` sets some options:

- **`atoms`**: `array`
- **`cards`**: `array`
- **`markups`**: `array`
- **`sections`**: `array`
- **`additionalProps`**: `object`

`atoms`, `cards`, `markups` and `sections` require array of objects with these attributes:

- **`name`**: `string`
- **`component`**: `Component|Function`

Example for a custom `Mention` atom:

```jsx
// Mentions.js
export default function Mention({username, ...props}) {
  return (
    <span className="mention" {...props}>
      @{username}
    </span>
  )
}

// RichText.js
import Mention from './Mention'

const configuration = {
  atoms: [
    {
      name: 'mention'
      component: Mention
    }
  ]
}

function RichText({ doc, ...props }) {
  const output = useMobiledoc(doc, configuration)

  return (
    <div className="richtext" {...props}>
      {output}
    </div>
  )
}
```

## Development

### Requirements

- [Node](https://nodejs.org)
- [yarn](https://yarnpkg.com/en/docs/install)

### Install Dependencies

```bash
yarn
```

### Build for production

To build a production version, run:

```bash
yarn build
```

> This library is built using [Rollup.js](https://rollupjs.org)

## Licence

MIT (see LICENCE file).

## Copyright

&copy; 2019 [Stimme der Hoffnung e.V](https://stimme-der-hoffnung.de) in Germany
