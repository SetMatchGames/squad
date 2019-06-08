import React from 'react';
import './App.css';

import { Elements } from 'elements/Elements'

function App() {
  return (
    <div>
      <div className="App-header">
        SQUAD
      </div>
      <Elements elementType="Game" title="Games"/>
      <Elements elementType="Format" title="Formats"/>
      <Elements elementType="Component" title="Components"/>
    </div>
  );
}

export default App;
