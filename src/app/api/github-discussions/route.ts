// Snapshot of src/app/api/github-discussions/route.ts on 2025-10-19

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

async function githubGraphQL(query: string, variables?: unknown) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  let json: unknown = null
  try {
    json = await res.json()
  } catch {
    return { ok: res.ok, status: res.status, json: null, errors: [{ message: 'invalid-json' }] }
  }

  const j = json as Record<string, unknown> | null
  if (!res.ok || (j && 'errors' in j)) {
    return { ok: false, status: res.status, json, errors: j ? (j['errors'] as unknown) : undefined }
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
  // Safely extract repository id from GraphQL JSON without using `any`.
  let repositoryId: string | undefined
  try {
    const repoJson = repoRes.json as unknown
    if (repoJson && typeof repoJson === 'object' && 'data' in repoJson) {
      const data = (repoJson as Record<string, unknown>)['data'] as unknown
      if (data && typeof data === 'object' && 'repository' in (data as Record<string, unknown>)) {
        const repository = (data as Record<string, unknown>)['repository'] as unknown
        if (repository && typeof repository === 'object' && 'id' in (repository as Record<string, unknown>)) {
          const id = (repository as Record<string, unknown>)['id']
          if (typeof id === 'string') repositoryId = id
        }
      }
    }
  } catch {
    repositoryId = undefined
  }
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
  // Safely extract discussion nodes
  let nodes: Array<Record<string, unknown>> = []
  try {
    const listJson = listRes.json as unknown
    if (listJson && typeof listJson === 'object' && 'data' in listJson) {
      const data = (listJson as Record<string, unknown>)['data'] as unknown
      if (data && typeof data === 'object' && 'repository' in (data as Record<string, unknown>)) {
        const repository = (data as Record<string, unknown>)['repository'] as unknown
        if (repository && typeof repository === 'object' && 'discussions' in (repository as Record<string, unknown>)) {
          const discussions = ((repository as Record<string, unknown>)['discussions'] as unknown) as Record<string, unknown>
          if (discussions && typeof discussions === 'object' && 'nodes' in discussions) {
            const n = (discussions['nodes'] as unknown)
            if (Array.isArray(n)) nodes = n as Array<Record<string, unknown>>
          }
        }
      }
    }
  } catch {
    nodes = []
  }
  const existing = nodes.find((n) => typeof n.title === 'string' && (n.title as string) === discussionTitle)

    if (existing) {
      // add a comment — different GitHub GraphQL schemas expose different payload fields.
      const bodyText = `**${name}** 留言:\n${text}`

      // Try 'comment' first, fall back to 'discussionComment' if schema differs.
      const tryMutation = async (fieldName: 'comment' | 'discussionComment') => {
        const addCommentMutation = `mutation addComment($discussionId: ID!, $body: String!) {
          addDiscussionComment(input: { discussionId: $discussionId, body: $body }) { ${fieldName} { id } }
        }`
        return githubGraphQL(addCommentMutation, { discussionId: String((existing as Record<string, unknown>)['id']), body: bodyText })
      }

      // first attempt
      let commentRes = await tryMutation('comment')
      if (!commentRes.ok) {
        // If the error mentions the field name, try the alternative
        const errMsg = JSON.stringify(commentRes.errors || commentRes.json || '')
        if (errMsg.includes("'comment'") || errMsg.includes('comment')) {
          commentRes = await tryMutation('discussionComment')
        }
      }

      if (!commentRes.ok) {
        console.error('GitHub addDiscussionComment error', commentRes)
        return NextResponse.json({ error: 'Failed to add comment', detail: commentRes.json || commentRes }, { status: 502 })
      }

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
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json({ error: 'GitHub integration not configured' }, { status: 500 })
  }

  const url = new URL(request.url)
  const path = url.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Missing path query' }, { status: 400 })

  const [owner, repo] = GITHUB_REPO.split('/')

  try {
    // 1) get repository id (reuse repoQuery)
    const repoQuery = `query repoId($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { id } }`
    const repoRes = await githubGraphQL(repoQuery, { owner, name: repo })
    if (!repoRes.ok) {
      console.error('GitHub repoId error', repoRes)
      return NextResponse.json({ error: 'GitHub repoId error', detail: repoRes.json || repoRes }, { status: 502 })
    }

    let repositoryId: string | undefined
    try {
      const repoJson = repoRes.json as unknown
      if (repoJson && typeof repoJson === 'object' && 'data' in repoJson) {
        const data = (repoJson as Record<string, unknown>)['data'] as unknown
        if (data && typeof data === 'object' && 'repository' in (data as Record<string, unknown>)) {
          const repository = (data as Record<string, unknown>)['repository'] as unknown
          if (repository && typeof repository === 'object' && 'id' in (repository as Record<string, unknown>)) {
            const id = (repository as Record<string, unknown>)['id']
            if (typeof id === 'string') repositoryId = id
          }
        }
      }
    } catch {
      repositoryId = undefined
    }
    if (!repositoryId) {
      console.error('Could not get repository id', repoRes.json)
      return NextResponse.json({ error: 'Could not get repository id', detail: repoRes.json }, { status: 500 })
    }

    // discussion title uses the page path
    const discussionTitle = `Comments: ${path}`

    // list discussions and find matching title
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

    let nodes: Array<Record<string, unknown>> = []
    try {
      const listJson = listRes.json as unknown
      if (listJson && typeof listJson === 'object' && 'data' in listJson) {
        const data = (listJson as Record<string, unknown>)['data'] as unknown
        if (data && typeof data === 'object' && 'repository' in (data as Record<string, unknown>)) {
          const repository = (data as Record<string, unknown>)['repository'] as unknown
          if (repository && typeof repository === 'object' && 'discussions' in (repository as Record<string, unknown>)) {
            const discussions = ((repository as Record<string, unknown>)['discussions'] as unknown) as Record<string, unknown>
            if (discussions && typeof discussions === 'object' && 'nodes' in discussions) {
              const n = (discussions['nodes'] as unknown)
              if (Array.isArray(n)) nodes = n as Array<Record<string, unknown>>
            }
          }
        }
      }
    } catch {
      nodes = []
    }
    const existing = nodes.find((n) => typeof n.title === 'string' && (n.title as string) === discussionTitle)

    if (!existing) {
      // no discussion yet -> no comments
      return NextResponse.json({ comments: [] })
    }

    const discussionId = String((existing as Record<string, unknown>)['id'])

    // fetch discussion initial body and discussion comments by node id
    const commentsQuery = `query getComments($id: ID!) { node(id: $id) { ... on Discussion { body createdAt author { login } comments(first: 100) { nodes { body createdAt author { login } } } } } }`
    const commentsRes = await githubGraphQL(commentsQuery, { id: discussionId })
    if (!commentsRes.ok) {
      console.error('GitHub comments query error', commentsRes)
      return NextResponse.json({ error: 'Failed to fetch comments', detail: commentsRes.json || commentsRes }, { status: 502 })
    }

    // extract comment nodes safely
    let commentNodes: Array<Record<string, unknown>> = []
    try {
      const cj = commentsRes.json as unknown
      if (cj && typeof cj === 'object' && 'data' in cj) {
        const data = (cj as Record<string, unknown>)['data'] as unknown
        if (data && typeof data === 'object' && 'node' in (data as Record<string, unknown>)) {
          const node = (data as Record<string, unknown>)['node'] as unknown
          if (node && typeof node === 'object' && 'comments' in (node as Record<string, unknown>)) {
            const comments = ((node as Record<string, unknown>)['comments'] as unknown) as Record<string, unknown>
            if (comments && typeof comments === 'object' && 'nodes' in comments) {
              const n = comments['nodes'] as unknown
              if (Array.isArray(n)) commentNodes = n as Array<Record<string, unknown>>
            }
          }
        }
      }
    } catch {
      commentNodes = []
    }

    // Map commentNodes to { name, text, date }
    const commentsOut = commentNodes.map((c) => {
      const body = typeof c.body === 'string' ? c.body : ''
      const createdAt = typeof c.createdAt === 'string' ? c.createdAt : ''
      const author = (c.author && typeof c.author === 'object') ? (c.author as Record<string, unknown>) : null
      const login = author && typeof author.login === 'string' ? author.login : undefined

      // try to extract name from body pattern: **Name** 留言:\n...
      const nameMatch = body.match(/^\s*\*\*(.+?)\*\*\s*留言[:：]?\s*\n?/) as RegExpMatchArray | null
      const name = nameMatch ? nameMatch[1] : (login || '匿名')
      let text = nameMatch ? body.replace(nameMatch[0], '').trim() : body.trim()
      // Fallback: if text empty but body contains markdown, keep body
      if (!text) text = body.trim()

      return { name, text, date: createdAt ? new Date(createdAt).toISOString() : '' }
    })

    // Sort comments chronologically (oldest first)
    commentsOut.sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0
      const tb = b.date ? new Date(b.date).getTime() : 0
      return ta - tb
    })

    // Also include the discussion's initial body as the first comment (if present)
    try {
      const cj = commentsRes.json as unknown
      if (cj && typeof cj === 'object' && 'data' in cj) {
        const data = (cj as Record<string, unknown>)['data'] as unknown
        if (data && typeof data === 'object' && 'node' in (data as Record<string, unknown>)) {
          const node = (data as Record<string, unknown>)['node'] as unknown
          if (node && typeof node === 'object') {
            const discBody = typeof (node as Record<string, unknown>)['body'] === 'string' ? (node as Record<string, unknown>)['body'] as string : ''
            const discCreatedAt = typeof (node as Record<string, unknown>)['createdAt'] === 'string' ? (node as Record<string, unknown>)['createdAt'] as string : ''
            const discAuthor = ((node as Record<string, unknown>)['author'] && typeof (node as Record<string, unknown>)['author'] === 'object') ? ((node as Record<string, unknown>)['author'] as Record<string, unknown>) : null
            const discLogin = discAuthor && typeof discAuthor.login === 'string' ? discAuthor.login : undefined

            if (discBody) {
              const nameMatch = discBody.match(/^\s*\*\*(.+?)\*\*\s*留言[:：]?\s*\n?/) as RegExpMatchArray | null
              const firstName = nameMatch ? nameMatch[1] : (discLogin || '匿名')
              let firstText = nameMatch ? discBody.replace(nameMatch[0], '').trim() : discBody.trim()
              if (!firstText) firstText = discBody.trim()
              const firstComment = { name: firstName, text: firstText, date: discCreatedAt ? new Date(discCreatedAt).toISOString() : '' }
              // place initial discussion at the start
              commentsOut.unshift(firstComment)
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // convert ISO dates back to locale strings for display
    const commentsFinal = commentsOut.map((c) => ({ name: c.name, text: c.text, date: c.date ? new Date(c.date).toLocaleString() : '' }))

    return NextResponse.json({ comments: commentsFinal })
  } catch (err) {
    console.error('GitHub Discussions GET error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

