import React, { useContext, MouseEvent } from 'react'
import { Link } from 'gatsby'
import { MenuContext } from './MenuContext'
import clsx from 'clsx'
import { MenuValue } from './type'

interface MenuItemProps {
  children: React.ReactNode
  href?: string
  value: MenuValue
  disabled?: boolean
  onClick?: (context: { e: MouseEvent<HTMLElement>; value: MenuValue }) => void
}

// 菜单项组件
const MenuItem: React.FC<MenuItemProps> = ({ children, href, value, disabled, onClick }) => {
  const context = useContext(MenuContext)
  if (!context) throw new Error('MenuItem must be used within a Menu')

  const handleClick = (e: MouseEvent<HTMLLIElement>) => {
    e.stopPropagation()
    if (disabled) return
    onClick?.({ e, value })
    console.log('click', value)
    context.setState({ active: value })
  }

  return (
    <li
      className={clsx('post-menu-item', {
        'post-menu-item--is-disabled': disabled,
        'post-menu-item--is-active': value === context.active
      })}
      onClick={handleClick}>
      {href ? (
        <Link to={href} className="post-menu-item__content">
          {children}
        </Link>
      ) : (
        <span className="post-menu-item__content">{children}</span>
      )}
    </li>
  )
}

export default MenuItem
