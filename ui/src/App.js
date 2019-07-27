import React from 'react'
import './App.css'

import { connect } from 'react-redux'

import DefintionForm from './definitions/DefinitionForm'
import Catalog from './definitions/Catalog'

function App(props) {
  const catalogComponents = Object.keys(props.catalogs).map(
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
      <DefintionForm mapState={s => s.definitionForm} />
      {catalogComponents}
    </div>
  )
}

export default connect(x => x)(App)
