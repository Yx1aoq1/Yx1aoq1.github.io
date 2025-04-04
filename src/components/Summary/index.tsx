import * as React from 'react'
import * as styles from './index.module.scss'
import { graphql, useStaticQuery } from 'gatsby'

interface SummaryProps {
  children?: React.ReactNode
}

const Summary: React.FC<SummaryProps> = ({ children }) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
          }
        }
      }
    `
  )
  const defaultTitle = site.siteMetadata?.title
  return (
    <div className={styles.summary}>
      <div></div>
      <div>
        <div>{defaultTitle}</div>
        <div></div>
      </div>
    </div>
  )
}

export default Summary
