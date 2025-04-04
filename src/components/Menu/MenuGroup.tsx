import * as React from 'react'

interface MenuGroupProps {
  children: React.ReactNode
  title: string | React.ReactNode
}

const MenuGroup: React.FC<MenuGroupProps> = ({ children, title }) => (
  <div className="post-menu-group">
    <div className="post-menu-group__title">{title}</div>
    {children}
  </div>
)

export default MenuGroup
