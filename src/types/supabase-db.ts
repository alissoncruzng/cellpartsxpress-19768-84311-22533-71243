export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at?: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          role: 'client' | 'wholesale' | 'driver' | 'admin'
          is_approved: boolean
          is_blocked: boolean
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          cpf: string | null
          cnpj: string | null
          company_name: string | null
          cnh_number: string | null
          cnh_image_url: string | null
          work_policy_accepted: boolean
          work_policy_accepted_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          role?: 'client' | 'wholesale' | 'driver' | 'admin'
          is_approved?: boolean
          is_blocked?: boolean
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          cpf?: string | null
          cnpj?: string | null
          company_name?: string | null
          cnh_number?: string | null
          cnh_image_url?: string | null
          work_policy_accepted?: boolean
          work_policy_accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          role?: 'client' | 'wholesale' | 'driver' | 'admin'
          is_approved?: boolean
          is_blocked?: boolean
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          cpf?: string | null
          cnpj?: string | null
          company_name?: string | null
          cnh_number?: string | null
          cnh_image_url?: string | null
          work_policy_accepted?: boolean
          work_policy_accepted_at?: string | null
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
