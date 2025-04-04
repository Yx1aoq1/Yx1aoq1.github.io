import React from 'react'
import * as styles from './index.module.scss'
import clsx from 'clsx'
import Sider from '@/components/Sider'
import Container from '@/components/Container'
import Summary from '@/components/Summary'
import { Menu, MenuGroup, MenuItem, SubMenu } from '@/components/Menu'
import '@/components/Menu/menu.scss'
import { graphql, useStaticQuery } from 'gatsby'
import { useLocation } from '@reach/router'

interface LayoutProps {
  children: React.ReactNode
  className?: string
}

type DataProps = {
  allMarkdownRemark: {
    group: Array<{
      category: string
      totalCount: number
      nodes: Array<{
        frontmatter: {
          title: string
        }
        fields: {
          slug: string
        }
      }>
    }>
  }
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const location = useLocation()
  const [category, active] = decodeURIComponent(location.pathname)
    .split('/')
    .filter((item) => !!item)
  const { allMarkdownRemark } = useStaticQuery<DataProps>(
    graphql`
      {
        allMarkdownRemark {
          group(field: { frontmatter: { categories: SELECT } }) {
            category: fieldValue
            totalCount
            nodes {
              frontmatter {
                title
              }
              fields {
                slug
              }
            }
          }
        }
      }
    `
  )
  return (
    <div className={clsx(styles.appLayout, className)}>
      <Sider>
        <Summary />
        <Menu value={active ?? '主页'} expanded={category ? [category] : []}>
          <MenuItem value="主页" href="/">
            主页
          </MenuItem>
          <MenuGroup title="分类">
            {allMarkdownRemark.group.map((item) => {
              return (
                <SubMenu key={item.category} value={item.category} title={item.category}>
                  {item.nodes.map((node) => {
                    return (
                      <MenuItem key={node.frontmatter.title} value={node.frontmatter.title} href={node.fields.slug}>
                        {node.frontmatter.title}
                      </MenuItem>
                    )
                  })}
                </SubMenu>
              )
            })}
          </MenuGroup>
        </Menu>
      </Sider>
      <Container>{children}</Container>
    </div>
  )
}

export default Layout
