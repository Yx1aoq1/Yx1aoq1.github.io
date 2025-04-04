import tocbot from 'tocbot'
import React, { useEffect, useRef } from 'react'
import { useLocation } from '@reach/router'
import '@/components/Toc/toc.scss'

interface TocProps {
  children?: React.ReactNode
}

tocbot.init({
  tocSelector: '.tocbot',
  contentSelector: '.content',
  headingSelector: 'h1, h2, h3, h4, h5',
  collapseDepth: 2,
  orderedList: false
} as tocbot.IStaticOptions)

const Toc: React.FC<TocProps> = ({ children }) => {
  const oldLocation = useRef<string | null>()
  const location = useLocation()
  useEffect(() => {
    if (location.pathname !== oldLocation.current) {
      tocbot.refresh()
      oldLocation.current = location.pathname
    }
  })

  return <div className="tocbot"></div>
}

export default Toc
