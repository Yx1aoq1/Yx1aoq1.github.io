import React from 'react'
import { MenuValue } from './type'

// 上下文相关
export interface MenuState {
  active?: MenuValue
  collapsed?: boolean
  expanded?: MenuValue[]
}

export type SetMenuState = React.Dispatch<React.SetStateAction<MenuState>>

interface MenuContextType extends MenuState {
  setState: SetMenuState
  onExpand: (value: MenuValue, expanded: MenuValue[]) => void
}

export const MenuContext = React.createContext<MenuContextType | null>(null)
