import * as React from 'react'
import * as styles from './index.module.scss'

interface ContainerProps {
  children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className={styles.appContainer}>{children}</div>
}

export default Container
