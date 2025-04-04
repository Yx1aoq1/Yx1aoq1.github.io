import React, { useMemo, useState } from 'react'
import { MenuValue } from './type'
import { MenuContext, MenuState, SetMenuState } from './MenuContext'
import clsx from 'clsx'

interface MenuProps {
  children: React.ReactNode
  head?: React.ReactNode
  value?: MenuValue
  expanded?: MenuValue[]
  collapsed?: boolean
}

// Menu 主组件
const Menu: React.FC<MenuProps> = (props) => {
  const { children, head } = props

  const [state, setState] = useState<MenuState>({
    active: props.value,
    expanded: props.expanded ?? [],
    collapsed: props.collapsed ?? false
  })

  const setStateValue: SetMenuState = (menuState) => setState({ ...state, ...menuState })

  const handleExpandChange = (value: MenuValue, expanded: MenuValue[]) => {
    let nextExpand = []
    const index = expanded.indexOf(value)

    // 已经展开
    if (index > -1) {
      nextExpand = expanded.slice(0, index)
    } else {
      nextExpand = [...expanded, value]
    }
    setStateValue({ expanded: nextExpand })
  }

  const value = useMemo(
    () => ({
      ...state,
      setState: setStateValue,
      onExpand: handleExpandChange
    }),
    [state]
  )

  return (
    <MenuContext.Provider value={value}>
      {head && <div>{head}</div>}
      <div className={clsx('post-menu', { 'is-collapsed': state.collapsed })}>
        <ul className="post-menu-inner">{children}</ul>
      </div>
    </MenuContext.Provider>
  )
}

export default Menu
