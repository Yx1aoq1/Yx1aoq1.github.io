import * as React from 'react'
import * as styles from './index.module.scss'
import Toc from '@/components/Toc'

interface ContentProps {
  children: React.ReactNode
}

const Content: React.FC<ContentProps> = ({ children }) => {
  return (
    <div className="content columns">
      <div className="column col-10 col-lg-12">
        <div className={styles.post}>{children}</div>
      </div>
      <div className="column col-2 hide-lg">
        <div className={styles.postInfo}>
          <Toc />
        </div>
      </div>
    </div>
  )
}

export default Content
