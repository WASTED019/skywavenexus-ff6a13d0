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
      admin_activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          button_link: string | null
          button_text: string | null
          hero_body: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          sections: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          hero_body?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          sections?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          hero_body?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          sections?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      homepage_content_versions: {
        Row: {
          created_at: string
          edited_by: string | null
          id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          edited_by?: string | null
          id?: string
          payload: Json
        }
        Update: {
          created_at?: string
          edited_by?: string | null
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      homepage_slides: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_slides_versions: {
        Row: {
          created_at: string
          edited_by: string | null
          id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          edited_by?: string | null
          id?: string
          payload: Json
        }
        Update: {
          created_at?: string
          edited_by?: string | null
          id?: string
          payload?: Json
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          id: string
          mime_type: string | null
          public_url: string
          size_bytes: number | null
          storage_path: string
          title: string | null
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          mime_type?: string | null
          public_url: string
          size_bytes?: number | null
          storage_path: string
          title?: string | null
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          mime_type?: string | null
          public_url?: string
          size_bytes?: number | null
          storage_path?: string
          title?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      password_reset_requests: {
        Row: {
          decided_at: string | null
          decided_by: string | null
          email: string | null
          expires_at: string
          id: string
          identifier: string
          reason: string | null
          requested_at: string
          status: string
          user_id: string | null
        }
        Insert: {
          decided_at?: string | null
          decided_by?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          identifier: string
          reason?: string | null
          requested_at?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          decided_at?: string | null
          decided_by?: string | null
          email?: string | null
          expires_at?: string
          id?: string
          identifier?: string
          reason?: string | null
          requested_at?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      service_lines: {
        Row: {
          button_link: string | null
          display_order: number
          full_desc: string | null
          image_url: string | null
          services: Json
          short_desc: string | null
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          button_link?: string | null
          display_order?: number
          full_desc?: string | null
          image_url?: string | null
          services?: Json
          short_desc?: string | null
          slug: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          button_link?: string | null
          display_order?: number
          full_desc?: string | null
          image_url?: string | null
          services?: Json
          short_desc?: string | null
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          admin_feedback: string | null
          assigned_staff: string | null
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
          follow_up_status: string | null
          full_name: string
          id: string
          internal_notes: string | null
          phone: string
          priority: string | null
          quote_status: string | null
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
          assigned_staff?: string | null
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
          follow_up_status?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          phone: string
          priority?: string | null
          quote_status?: string | null
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
          assigned_staff?: string | null
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
          follow_up_status?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          phone?: string
          priority?: string | null
          quote_status?: string | null
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
      site_settings: {
        Row: {
          email: string | null
          footer_links: Json
          footer_text: string | null
          id: string
          location: string | null
          logo_url: string | null
          phone: string | null
          social_links: Json
          updated_at: string
          updated_by: string | null
          whatsapp: string | null
        }
        Insert: {
          email?: string | null
          footer_links?: Json
          footer_text?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          social_links?: Json
          updated_at?: string
          updated_by?: string | null
          whatsapp?: string | null
        }
        Update: {
          email?: string | null
          footer_links?: Json
          footer_text?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          social_links?: Json
          updated_at?: string
          updated_by?: string | null
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
      approve_password_reset: {
        Args: { _id: string }
        Returns: {
          decided_at: string | null
          decided_by: string | null
          email: string | null
          expires_at: string
          id: string
          identifier: string
          reason: string | null
          requested_at: string
          status: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "password_reset_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      clear_reset_flag: { Args: never; Returns: undefined }
      customer_can_reset: { Args: { _identifier: string }; Returns: boolean }
      delete_media: { Args: { _id: string }; Returns: undefined }
      delete_slide: { Args: { _id: string }; Returns: undefined }
      has_min_role: {
        Args: { _min: Database["public"]["Enums"]["app_role"]; _uid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _uid: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          _action: string
          _entity_id: string
          _entity_type: string
          _new: Json
          _old: Json
        }
        Returns: undefined
      }
      register_media: {
        Args: { _payload: Json }
        Returns: {
          alt_text: string | null
          category: string | null
          created_at: string
          id: string
          mime_type: string | null
          public_url: string
          size_bytes: number | null
          storage_path: string
          title: string | null
          uploaded_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "media_assets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_password_reset: {
        Args: { _id: string; _reason: string }
        Returns: {
          decided_at: string | null
          decided_by: string | null
          email: string | null
          expires_at: string
          id: string
          identifier: string
          reason: string | null
          requested_at: string
          status: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "password_reset_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      request_password_reset: { Args: { _identifier: string }; Returns: string }
      resolve_login_email: { Args: { identifier: string }; Returns: string }
      role_rank: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
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
      update_homepage_content: {
        Args: { _payload: Json }
        Returns: {
          button_link: string | null
          button_text: string | null
          hero_body: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          sections: Json
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "homepage_content"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_request_meta: {
        Args: { _id: string; _payload: Json }
        Returns: {
          admin_feedback: string | null
          assigned_staff: string | null
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
          follow_up_status: string | null
          full_name: string
          id: string
          internal_notes: string | null
          phone: string
          priority: string | null
          quote_status: string | null
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
        SetofOptions: {
          from: "*"
          to: "service_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_site_settings: {
        Args: { _payload: Json }
        Returns: {
          email: string | null
          footer_links: Json
          footer_text: string | null
          id: string
          location: string | null
          logo_url: string | null
          phone: string | null
          social_links: Json
          updated_at: string
          updated_by: string | null
          whatsapp: string | null
        }
        SetofOptions: {
          from: "*"
          to: "site_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_service_line: {
        Args: { _payload: Json }
        Returns: {
          button_link: string | null
          display_order: number
          full_desc: string | null
          image_url: string | null
          services: Json
          short_desc: string | null
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "service_lines"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_slide: {
        Args: { _payload: Json }
        Returns: {
          button_link: string | null
          button_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "homepage_slides"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "customer"
        | "super_admin"
        | "staff"
        | "viewer"
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
      app_role: ["admin", "user", "customer", "super_admin", "staff", "viewer"],
    },
  },
} as const
