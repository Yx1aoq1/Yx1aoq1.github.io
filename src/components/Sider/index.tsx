import * as React from 'react'
import * as styles from './index.module.scss'

interface SiderProps {
  children: React.ReactNode
}

const Sider: React.FC<SiderProps> = ({ children }) => {
  return <aside className={styles.sider}>{children}</aside>
}

export default Sider
