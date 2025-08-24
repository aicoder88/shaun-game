export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          code: string
          scene: string
          teacher_id: string | null
          student_id: string | null
          killer_id: string | null
          lens_charges: number
          inventory: Record<string, any>
          hotspots: Record<string, any>
          suspects: Record<string, any>
          locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          scene?: string
          teacher_id?: string | null
          student_id?: string | null
          killer_id?: string | null
          lens_charges?: number
          inventory?: Record<string, any>
          hotspots?: Record<string, any>
          suspects?: Record<string, any>
          locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          scene?: string
          teacher_id?: string | null
          student_id?: string | null
          killer_id?: string | null
          lens_charges?: number
          inventory?: Record<string, any>
          hotspots?: Record<string, any>
          suspects?: Record<string, any>
          locked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          room_id: string
          actor: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          actor: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          actor?: string
          text?: string
          created_at?: string
        }
      }
      chat: {
        Row: {
          id: string
          room_id: string
          sender: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender?: string
          message?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}