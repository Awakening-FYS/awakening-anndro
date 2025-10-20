
// Minimal supabase types for the project. Adjust if you generate full types from your Supabase schema.
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
	public: {
		Tables: {
			[key: string]: unknown
		}
		Views: {
			[key: string]: unknown
		}
		Functions: {
			[key: string]: unknown
		}
	}
}