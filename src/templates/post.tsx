import * as React from 'react'
import { Link, graphql } from 'gatsby'
import Content from '@/components/Content'
import Seo from '@/components/Seo'

const PostTemplate = ({ data: { previous, next, site, markdownRemark: post }, location }) => {
  return (
    <Content>
      <div dangerouslySetInnerHTML={{ __html: post.html }}></div>
    </Content>
  )
}

export default PostTemplate

export const Head = ({ data: { markdownRemark: post } }) => {
  return <Seo title={post.frontmatter.title} description={post.frontmatter.description || post.excerpt} />
}

export const pageQuery = graphql`
  query BlogPostBySlug($id: String!, $previousPostId: String, $nextPostId: String) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
