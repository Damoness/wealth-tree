import React, { useEffect } from 'react'
import './App.css'

import './sass/main.sass'

import { tsv } from 'd3'

import WealthTree from './WealthTree'
const dataPath = require('./data/data4.tsv')

function parseData({ outcome, decision, name, sequence }: any) {
  return {
    outcome,
    decision,
    name,
    sequence: sequence.split(''),
  }
}

function App() {
  const [data, setData] = React.useState([])

  useEffect(() => {
    tsv(dataPath).then((d: any) => {
      const r = d.map(parseData)
      setData(r)
    })
  }, [])
  return data.length > 0 ? <WealthTree data={data} filter="K" /> : null
}

export default App
