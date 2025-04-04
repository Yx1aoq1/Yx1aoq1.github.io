import React from 'react'
import Layout from './src/components/Layout'
import { WrapPageElementBrowserArgs } from 'gatsby'

export const wrapPageElement = ({ element, props }: WrapPageElementBrowserArgs) => {
  return <Layout {...props}>{element}</Layout>
}
