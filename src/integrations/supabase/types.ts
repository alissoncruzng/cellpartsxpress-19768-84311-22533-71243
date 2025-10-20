export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      delivery_configs: {
        Row: {
          base_fee: number
          created_at: string | null
          id: string
          is_active: boolean | null
          max_distance_km: number | null
          per_km_fee: number
          region: string
        }
        Insert: {
          base_fee: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_distance_km?: number | null
          per_km_fee: number
          region: string
        }
        Update: {
          base_fee?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_distance_km?: number | null
          per_km_fee?: number
          region?: string
        }
        Relationships: []
      }
      delivery_proofs: {
        Row: {
          created_at: string | null
          driver_id: string
          file_url: string
          id: string
          order_id: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          file_url: string
          id?: string
          order_id: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          file_url?: string
          id?: string
          order_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_proofs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string
          created_at: string | null
          delivery_address: string
          delivery_cep: string
          delivery_city: string
          delivery_fee: number
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_photo_url: string | null
          delivery_state: string
          driver_id: string | null
          driver_notes: string | null
          id: string
          issue_reported: boolean | null
          pickup_address: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          pickup_photo_url: string | null
          signature_data: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          delivery_address: string
          delivery_cep: string
          delivery_city: string
          delivery_fee: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_photo_url?: string | null
          delivery_state: string
          driver_id?: string | null
          driver_notes?: string | null
          id?: string
          issue_reported?: boolean | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          pickup_photo_url?: string | null
          signature_data?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          delivery_address?: string
          delivery_cep?: string
          delivery_city?: string
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_photo_url?: string | null
          delivery_state?: string
          driver_id?: string | null
          driver_notes?: string | null
          id?: string
          issue_reported?: boolean | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          pickup_photo_url?: string | null
          signature_data?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string
          type: string
          updated_at: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          type: string
          updated_at?: string | null
          version: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          cep: string | null
          city: string | null
          cnh_image_url: string | null
          cnh_number: string | null
          created_at: string | null
          full_name: string
          id: string
          is_approved: boolean | null
          is_blocked: boolean | null
          phone: string | null
          privacy_policy_accepted_at: string | null
          rejection_count: number | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          updated_at: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
          warranty_policy_accepted_at: string | null
          work_policy_accepted_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          cep?: string | null
          city?: string | null
          cnh_image_url?: string | null
          cnh_number?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_approved?: boolean | null
          is_blocked?: boolean | null
          phone?: string | null
          privacy_policy_accepted_at?: string | null
          rejection_count?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          warranty_policy_accepted_at?: string | null
          work_policy_accepted_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          cep?: string | null
          city?: string | null
          cnh_image_url?: string | null
          cnh_number?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_approved?: boolean | null
          is_blocked?: boolean | null
          phone?: string | null
          privacy_policy_accepted_at?: string | null
          rejection_count?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          updated_at?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          warranty_policy_accepted_at?: string | null
          work_policy_accepted_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          description: string
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          target_role: Database["public"]["Enums"]["user_role"] | null
          title: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          target_role?: Database["public"]["Enums"]["user_role"] | null
          title: string
          valid_from: string
          valid_until: string
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          target_role?: Database["public"]["Enums"]["user_role"] | null
          title?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          app_rating: number
          client_id: string
          comment: string | null
          created_at: string | null
          delivery_rating: number
          driver_id: string
          driver_rating: number
          id: string
          order_id: string
        }
        Insert: {
          app_rating: number
          client_id: string
          comment?: string | null
          created_at?: string | null
          delivery_rating: number
          driver_id: string
          driver_rating: number
          id?: string
          order_id: string
        }
        Update: {
          app_rating?: number
          client_id?: string
          comment?: string | null
          created_at?: string | null
          delivery_rating?: number
          driver_id?: string
          driver_rating?: number
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rejection_logs: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          motivo: string | null
          order_id: string
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          motivo?: string | null
          order_id: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          motivo?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rejection_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          driver_id: string
          id: string
          order_id: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          driver_id: string
          id?: string
          order_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          driver_id?: string
          id?: string
          order_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client" | "driver"
      order_status:
        | "pending"
        | "confirmed"
        | "driver_assigned"
        | "picked_up"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      user_role: "client" | "driver" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client", "driver"],
      order_status: [
        "pending",
        "confirmed",
        "driver_assigned",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      user_role: ["client", "driver", "admin"],
    },
  },
} as const
