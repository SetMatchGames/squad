import React from 'react'
import './App.css'

import { connect } from 'react-redux'

import DefintionForm from './definitions/DefinitionForm'
import Catalog from './definitions/Catalog'

function App(props) {
  const catalogs = Object.keys(props.catalogs).map(
    (catalogKey) => {
      return (
        <Catalog
          key={catalogKey}
          mapState={s => s.catalogs[catalogKey]}
        />
      )
    }
  )
  return (
    <div>
      <div className="App-header">
        SQUAD
      </div>
      <div className="App-body">
        <DefintionForm mapState={s => s.definitionForm} />
        {catalogs}
      </div>
    </div>
  )
}

export default connect(x => x)(App)
