import React, { MouseEvent } from 'react'
import clsx from 'clsx'
import { useContext } from 'react'
import { MenuContext } from './MenuContext'
import { MenuValue } from './type'

interface SubMenuProps {
  children: React.ReactNode
  title: string | React.ReactNode
  value: MenuValue
  disabled?: boolean
}

// 子菜单组件
const SubMenu: React.FC<SubMenuProps> = ({ children, title, value, disabled = false }) => {
  const context = useContext(MenuContext)
  if (!context) throw new Error('MenuItem must be used within a Menu')

  const { expanded = [], onExpand } = context

  const isExpand = expanded.includes(value) && !disabled

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onExpand(value, expanded)
  }

  return (
    <li className={clsx('post-menu-submenu', { 'is-expanded': isExpand })}>
      <span className="post-menu-submenu__content" onClick={handleClick}>
        {title}
        <i className="icon icon-arrow-down"></i>
      </span>
      {isExpand && <ul>{children}</ul>}
    </li>
  )
}

export default SubMenu
