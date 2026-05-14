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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          county: string | null
          created_at: string
          delete_requested: boolean
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          reset_approved: boolean
          town: string | null
          updated_at: string
          username: string | null
          whatsapp: string | null
        }
        Insert: {
          county?: string | null
          created_at?: string
          delete_requested?: boolean
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          reset_approved?: boolean
          town?: string | null
          updated_at?: string
          username?: string | null
          whatsapp?: string | null
        }
        Update: {
          county?: string | null
          created_at?: string
          delete_requested?: boolean
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          reset_approved?: boolean
          town?: string | null
          updated_at?: string
          username?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      request_files: {
        Row: {
          created_at: string
          id: string
          mime_type: string | null
          original_name: string | null
          request_id: string
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          request_id: string
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          request_id?: string
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "my_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          admin_feedback: string | null
          client_type: string | null
          county: string
          created_at: string
          description: string
          division_details: Json
          division_id: string
          division_name: string
          email: string
          follow_up_date: string | null
          follow_up_method: string | null
          full_name: string
          id: string
          internal_notes: string | null
          phone: string
          ref: string
          service_id: string
          service_name: string
          status: string
          town: string
          updated_at: string
          urgency: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          admin_feedback?: string | null
          client_type?: string | null
          county: string
          created_at?: string
          description: string
          division_details?: Json
          division_id: string
          division_name: string
          email: string
          follow_up_date?: string | null
          follow_up_method?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          phone: string
          ref: string
          service_id: string
          service_name: string
          status?: string
          town: string
          updated_at?: string
          urgency?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          admin_feedback?: string | null
          client_type?: string | null
          county?: string
          created_at?: string
          description?: string
          division_details?: Json
          division_id?: string
          division_name?: string
          email?: string
          follow_up_date?: string | null
          follow_up_method?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          phone?: string
          ref?: string
          service_id?: string
          service_name?: string
          status?: string
          town?: string
          updated_at?: string
          urgency?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      my_requests: {
        Row: {
          admin_feedback: string | null
          client_type: string | null
          county: string | null
          created_at: string | null
          description: string | null
          division_details: Json | null
          division_id: string | null
          division_name: string | null
          email: string | null
          follow_up_date: string | null
          follow_up_method: string | null
          full_name: string | null
          id: string | null
          phone: string | null
          ref: string | null
          service_id: string | null
          service_name: string | null
          status: string | null
          town: string | null
          updated_at: string | null
          urgency: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          admin_feedback?: string | null
          client_type?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          division_details?: Json | null
          division_id?: string | null
          division_name?: string | null
          email?: string | null
          follow_up_date?: string | null
          follow_up_method?: string | null
          full_name?: string | null
          id?: string | null
          phone?: string | null
          ref?: string | null
          service_id?: string | null
          service_name?: string | null
          status?: string | null
          town?: string | null
          updated_at?: string | null
          urgency?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          admin_feedback?: string | null
          client_type?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          division_details?: Json | null
          division_id?: string | null
          division_name?: string | null
          email?: string | null
          follow_up_date?: string | null
          follow_up_method?: string | null
          full_name?: string | null
          id?: string | null
          phone?: string | null
          ref?: string | null
          service_id?: string | null
          service_name?: string | null
          status?: string | null
          town?: string | null
          updated_at?: string | null
          urgency?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      clear_reset_flag: { Args: never; Returns: undefined }
      customer_can_reset: { Args: { _identifier: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      resolve_login_email: { Args: { identifier: string }; Returns: string }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _target: string
        }
        Returns: undefined
      }
      track_request: {
        Args: { _contact: string; _ref: string }
        Returns: {
          admin_feedback: string
          created_at: string
          division_name: string
          ref: string
          service_name: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user" | "customer"
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
      app_role: ["admin", "user", "customer"],
    },
  },
} as const
