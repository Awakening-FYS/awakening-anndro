import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createDummyClient() {
	// Minimal dummy client that returns safe responses for common calls used in the app.
	const builder = () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const b: any = {
			select: () => b,
			eq: () => b,
			ilike: () => b,
			maybeSingle: async () => ({ data: null, error: null }),
			single: async () => ({ data: null, error: null }),
			insert: () => ({ select: async () => ({ data: null, error: null }) }),
		}
		return b
	}

		return {
			from: (_table: string) => {
				void _table // keep param for API compatibility, avoid unused-var warning
				return builder()
			},
		}
}

// allow any only for the runtime client handle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let realClient: any | null = null

function getClient() {
	if (realClient) return realClient
	if (supabaseUrl && supabaseAnonKey) {
		try {
			realClient = createClient(supabaseUrl, supabaseAnonKey)
			return realClient
		} catch {
			// fallthrough to dummy client below
		}
	}
	realClient = createDummyClient()
	return realClient
}

// expose a permissive supabase proxy; narrow in consuming modules where needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = new Proxy({}, {
	get(_, prop) {
		const c = getClient()
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (c as any)[prop]
	}
})
