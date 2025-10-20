import { NextResponse } from 'next/server'

type Body = {
  path: string // page path, used to identify discussion
  name: string
  text: string
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO // format owner/repo
const GITHUB_DISCUSSION_CATEGORY_ID = process.env.GITHUB_DISCUSSION_CATEGORY_ID

if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_DISCUSSION_CATEGORY_ID) {
  console.warn('GitHub Discussions API route missing required env vars')
}

async function githubGraphQL(query: string, variables?: any) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  let json: any = null
  try {
    json = await res.json()
  } catch (e) {
    return { ok: res.ok, status: res.status, json: null, errors: [{ message: 'invalid-json' }] }
  }

  if (!res.ok || json?.errors) {
    return { ok: false, status: res.status, json, errors: json?.errors }
  }

  return { ok: true, status: res.status, json }
}

export async function POST(request: Request) {
  if (!GITHUB_TOKEN || !GITHUB_REPO || !GITHUB_DISCUSSION_CATEGORY_ID) {
    return NextResponse.json({ error: 'GitHub integration not configured' }, { status: 500 })
  }

  const body: Body = await request.json()
  const { path, name, text } = body
  if (!path || !text) {
    return NextResponse.json({ error: 'Missing path or text' }, { status: 400 })
  }

  const [owner, repo] = GITHUB_REPO.split('/')

  try {
    // 1) get repository id
    const repoQuery = `query repoId($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) { id }
    }`
    const repoRes = await githubGraphQL(repoQuery, { owner, name: repo })
    if (!repoRes.ok) {
      console.error('GitHub repoId error', repoRes)
      return NextResponse.json({ error: 'GitHub repoId error', detail: repoRes.json || repoRes }, { status: 502 })
    }
    const repositoryId = repoRes.json?.data?.repository?.id
    if (!repositoryId) {
      console.error('Could not get repository id', repoRes.json)
      return NextResponse.json({ error: 'Could not get repository id', detail: repoRes.json }, { status: 500 })
    }

    // discussion title uses the page path (unique)
    const discussionTitle = `Comments: ${path}`

    // 2) try to find existing discussion by title (list first 100)
    const listQuery = `query listDiscussions($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        discussions(first: 100) { nodes { id title } }
      }
    }`
    const listRes = await githubGraphQL(listQuery, { owner, name: repo })
    if (!listRes.ok) {
      console.error('GitHub listDiscussions error', listRes)
      return NextResponse.json({ error: 'GitHub listDiscussions error', detail: listRes.json || listRes }, { status: 502 })
    }
    const nodes = listRes.json?.data?.repository?.discussions?.nodes || []
    const existing = nodes.find((n: any) => n.title === discussionTitle)

    if (existing) {
      // add a comment
      // The GraphQL payload shape can change; avoid selecting a field that may not exist on all API versions.
      // Request a minimal, stable field (clientMutationId) to avoid triggering schema errors.
      const addCommentMutation = `mutation addComment($discussionId: ID!, $body: String!) {
        addDiscussionComment(input: { discussionId: $discussionId, body: $body }) { clientMutationId }
      }`
      const bodyText = `**${name}** 留言:
\n${text}`
      const commentRes = await githubGraphQL(addCommentMutation, { discussionId: existing.id, body: bodyText })
      if (!commentRes.ok) {
        console.error('GitHub addDiscussionComment error', commentRes)
        return NextResponse.json({ error: 'Failed to add comment', detail: commentRes.json || commentRes }, { status: 502 })
      }
      // success (we didn't request the created comment object for compatibility)
      return NextResponse.json({ success: true, created: 'comment', result: commentRes.json })
    }

    // 3) create discussion in given category with initial body
    const createMutation = `mutation createDiscussion($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
      createDiscussion(input: { repositoryId: $repoId, categoryId: $categoryId, title: $title, body: $body }) {
        discussion { id url }
      }
    }`
    const bodyText = `**${name}** 留言:
\n${text}`
    const createRes = await githubGraphQL(createMutation, { repoId: repositoryId, categoryId: GITHUB_DISCUSSION_CATEGORY_ID, title: discussionTitle, body: bodyText })
    if (!createRes.ok) {
      console.error('GitHub createDiscussion error', createRes)
      return NextResponse.json({ error: 'Failed to create discussion', detail: createRes.json || createRes }, { status: 502 })
    }
    return NextResponse.json({ success: true, created: 'discussion', result: createRes.json })
  } catch (err) {
    console.error('GitHub Discussions error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // GET /api/github-discussions?path=/blog/slug
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json({ error: 'GitHub integration not configured' }, { status: 500 })
  }

  try {
    const url = new URL(request.url)
    const path = url.searchParams.get('path')
    if (!path) return NextResponse.json({ comments: [] })

    const [owner, repo] = GITHUB_REPO.split('/')

    const listWithCommentsQ = `query listDiscussionsWithComments($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        discussions(first: 100) {
          nodes {
            id
            title
            body
            createdAt
            comments(first: 100) {
              nodes {
                author { login }
                body
                createdAt
              }
            }
          }
        }
      }
    }`

    const listRes = await githubGraphQL(listWithCommentsQ, { owner, name: repo })
    if (!listRes.ok) {
      console.error('GitHub listDiscussionsWithComments error', listRes)
      return NextResponse.json({ error: 'GitHub listDiscussions error', detail: listRes.json || listRes }, { status: 502 })
    }

    const nodes = listRes.json?.data?.repository?.discussions?.nodes || []
    const discussionTitle = `Comments: ${path}`
    const existing = nodes.find((n: any) => n.title === discussionTitle)
    if (!existing) return NextResponse.json({ comments: [] })

    const rawComments = existing.comments?.nodes || []
    const comments = rawComments.map((c: any) => {
      const body: string = c.body || ''
      const nameMatch = body.match(/^\*\*(.+?)\*\*/)
      const name = nameMatch ? nameMatch[1] : (c.author?.login || '用户')
      const text = body.replace(/^(?:\*\*.+?\*\*\s*留言:\s*)/m, '').trim()
      return { name, text, date: c.createdAt }
    })

    // If the discussion has an initial body (we store the first post there), include it as the first comment
    if (existing.body) {
      const body: string = existing.body || ''
      const nameMatch = body.match(/^\*\*(.+?)\*\*/)
      const name = nameMatch ? nameMatch[1] : (/* no author on discussion body */ '用户')
      const text = body.replace(/^(?:\*\*.+?\*\*\s*留言:\s*)/m, '').trim()
      const discussionDate = existing.createdAt || null
      // Put initial discussion body at the top
      comments.unshift({ name, text, date: discussionDate })
    }

    return NextResponse.json({ comments })
  } catch (err: any) {
    console.error('GET /api/github-discussions error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

