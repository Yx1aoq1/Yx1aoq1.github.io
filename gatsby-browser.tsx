import 'spectre.css'
import 'spectre.css/dist/spectre-exp.css'
import 'spectre.css/dist/spectre-icons.css'
// custom CSS styles
import './src/styles/global.scss'
// Highlighting for code blocks
import 'prismjs/themes/prism.css'

import React from 'react'
import Layout from './src/components/Layout'
import { WrapPageElementBrowserArgs } from 'gatsby'

export const wrapPageElement = ({ element, props }: WrapPageElementBrowserArgs) => {
  return <Layout {...props}>{element}</Layout>
}
