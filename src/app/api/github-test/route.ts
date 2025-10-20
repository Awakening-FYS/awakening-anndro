import { NextResponse } from 'next/server'

async function callRest(token: string) {
  const res = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'awakening-site-diagnostic',
      Accept: 'application/vnd.github.v3+json',
    },
  })
  const json = await res.json().catch(() => null)
  return {
    status: res.status,
    ok: res.ok,
    scopes: res.headers.get('x-oauth-scopes') || null,
    json,
  }
}

async function callGraphQL(token: string, query = 'query { viewer { login } }') {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'User-Agent': 'awakening-site-diagnostic',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  const json = await res.json().catch(() => null)
  return {
    status: res.status,
    ok: res.ok,
    json,
  }
}

function maskToken(token: string | undefined | null) {
  if (!token || token.length === 0) return null
  const len = token.length
  if (len <= 8) return { length: len, preview: '****' }
  return { length: len, startsWith: token.slice(0, 4), endsWith: token.slice(-4) }
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN || null
    const repo = process.env.GITHUB_REPO || null
    const category = process.env.GITHUB_DISCUSSION_CATEGORY_ID || null

    const masked = maskToken(token)

    if (!token) {
      return NextResponse.json({ ok: false, reason: 'no_token_in_env', masked, repo, category }, { status: 400 })
    }

    // run both checks in parallel
    const [rest, graphql, cats] = await Promise.all([
      callRest(token),
      callGraphQL(token),
      callGraphQL(token, `query { repository(owner: \"${(process.env.GITHUB_REPO || 'Awakening-FYS/awakening-anndro').split('/')[0]}\", name: \"${(process.env.GITHUB_REPO || 'Awakening-FYS/awakening-anndro').split('/')[1]}\") { discussionCategories(first:20) { nodes { id name } } } }`),
    ])

    return NextResponse.json({ ok: true, masked, repo, category, rest, graphql, cats })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
