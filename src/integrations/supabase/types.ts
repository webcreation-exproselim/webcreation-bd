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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      abandoned_checkouts: {
        Row: {
          cart_data: Json | null
          checkout_url: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          is_recovered: boolean | null
          merchant_id: string
          recovered_at: string | null
        }
        Insert: {
          cart_data?: Json | null
          checkout_url?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          is_recovered?: boolean | null
          merchant_id: string
          recovered_at?: string | null
        }
        Update: {
          cart_data?: Json | null
          checkout_url?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          is_recovered?: boolean | null
          merchant_id?: string
          recovered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_checkouts_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      blacklist: {
        Row: {
          block_type: string
          blocked_value: string
          created_at: string
          id: string
          merchant_id: string
          reason: string | null
        }
        Insert: {
          block_type?: string
          blocked_value: string
          created_at?: string
          id?: string
          merchant_id: string
          reason?: string | null
        }
        Update: {
          block_type?: string
          blocked_value?: string
          created_at?: string
          id?: string
          merchant_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blacklist_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      courier_orders: {
        Row: {
          cod_amount: number | null
          consignment_id: string | null
          courier_type: string
          created_at: string
          delivery_fee: number | null
          id: string
          invoice_number: string | null
          last_synced_at: string | null
          merchant_id: string
          recipient_address: string | null
          recipient_name: string | null
          recipient_phone: string | null
          status: string | null
          tracking_code: string | null
        }
        Insert: {
          cod_amount?: number | null
          consignment_id?: string | null
          courier_type: string
          created_at?: string
          delivery_fee?: number | null
          id?: string
          invoice_number?: string | null
          last_synced_at?: string | null
          merchant_id: string
          recipient_address?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          status?: string | null
          tracking_code?: string | null
        }
        Update: {
          cod_amount?: number | null
          consignment_id?: string | null
          courier_type?: string
          created_at?: string
          delivery_fee?: number | null
          id?: string
          invoice_number?: string | null
          last_synced_at?: string | null
          merchant_id?: string
          recipient_address?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          status?: string | null
          tracking_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courier_orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_reviews: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          photo: string | null
          rating: number
          review: string
          service: string
          service_gradient: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          photo?: string | null
          rating?: number
          review: string
          service: string
          service_gradient?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo?: string | null
          rating?: number
          review?: string
          service?: string
          service_gradient?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fraud_logs: {
        Row: {
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          merchant_id: string
          phone_number: string | null
          status: string
        }
        Insert: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          merchant_id: string
          phone_number?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          merchant_id?: string
          phone_number?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_logs_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      incomplete_orders: {
        Row: {
          cart_items: Json | null
          cart_total: number | null
          created_at: string
          customer_name: string | null
          device_fingerprint: string | null
          failure_reason: string
          id: string
          ip_address: string | null
          is_converted: boolean
          is_suspicious: boolean
          merchant_id: string
          phone_number: string
        }
        Insert: {
          cart_items?: Json | null
          cart_total?: number | null
          created_at?: string
          customer_name?: string | null
          device_fingerprint?: string | null
          failure_reason?: string
          id?: string
          ip_address?: string | null
          is_converted?: boolean
          is_suspicious?: boolean
          merchant_id: string
          phone_number: string
        }
        Update: {
          cart_items?: Json | null
          cart_total?: number | null
          created_at?: string
          customer_name?: string | null
          device_fingerprint?: string | null
          failure_reason?: string
          id?: string
          ip_address?: string | null
          is_converted?: boolean
          is_suspicious?: boolean
          merchant_id?: string
          phone_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "incomplete_orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          order_id: string | null
          paid_amount: number
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          order_id?: string | null
          paid_amount?: number
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          order_id?: string | null
          paid_amount?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          abandoned_timeout_minutes: number | null
          api_key: string
          cooldown_period_days: number
          cooldown_period_minutes: number
          created_at: string
          current_plan: string | null
          enable_abandoned_tracking: boolean | null
          enable_incomplete_tracking: boolean | null
          id: string
          incomplete_auto_block_threshold: number | null
          incomplete_time_window_minutes: number | null
          is_active: boolean
          max_requests: number
          msg_blacklist: string | null
          msg_cooldown: string | null
          pathao_client_id: string | null
          pathao_client_secret: string | null
          pathao_password: string | null
          pathao_username: string | null
          phone_number: string | null
          plan_expires_at: string | null
          popup_language: string | null
          popup_timer_seconds: number | null
          redx_api_token: string | null
          requests_used: number
          show_contact_buttons: boolean | null
          steadfast_api_key: string | null
          steadfast_secret_key: string | null
          updated_at: string
          user_id: string
          website_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          abandoned_timeout_minutes?: number | null
          api_key?: string
          cooldown_period_days?: number
          cooldown_period_minutes?: number
          created_at?: string
          current_plan?: string | null
          enable_abandoned_tracking?: boolean | null
          enable_incomplete_tracking?: boolean | null
          id?: string
          incomplete_auto_block_threshold?: number | null
          incomplete_time_window_minutes?: number | null
          is_active?: boolean
          max_requests?: number
          msg_blacklist?: string | null
          msg_cooldown?: string | null
          pathao_client_id?: string | null
          pathao_client_secret?: string | null
          pathao_password?: string | null
          pathao_username?: string | null
          phone_number?: string | null
          plan_expires_at?: string | null
          popup_language?: string | null
          popup_timer_seconds?: number | null
          redx_api_token?: string | null
          requests_used?: number
          show_contact_buttons?: boolean | null
          steadfast_api_key?: string | null
          steadfast_secret_key?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          abandoned_timeout_minutes?: number | null
          api_key?: string
          cooldown_period_days?: number
          cooldown_period_minutes?: number
          created_at?: string
          current_plan?: string | null
          enable_abandoned_tracking?: boolean | null
          enable_incomplete_tracking?: boolean | null
          id?: string
          incomplete_auto_block_threshold?: number | null
          incomplete_time_window_minutes?: number | null
          is_active?: boolean
          max_requests?: number
          msg_blacklist?: string | null
          msg_cooldown?: string | null
          pathao_client_id?: string | null
          pathao_client_secret?: string | null
          pathao_password?: string | null
          pathao_username?: string | null
          phone_number?: string | null
          plan_expires_at?: string | null
          popup_language?: string | null
          popup_timer_seconds?: number | null
          redx_api_token?: string | null
          requests_used?: number
          show_contact_buttons?: boolean | null
          steadfast_api_key?: string | null
          steadfast_secret_key?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin: boolean | null
          order_id: string
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin?: boolean | null
          order_id: string
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin?: boolean | null
          order_id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          payment_method: string
          payment_screenshot_url: string | null
          progress: number | null
          sender_number: string | null
          services: Json
          status: string
          total_price: number
          total_savings: number
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          payment_method: string
          payment_screenshot_url?: string | null
          progress?: number | null
          sender_number?: string | null
          services?: Json
          status?: string
          total_price?: number
          total_savings?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          payment_method?: string
          payment_screenshot_url?: string | null
          progress?: number | null
          sender_number?: string | null
          services?: Json
          status?: string
          total_price?: number
          total_savings?: number
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          account_name: string | null
          account_number: string
          created_at: string
          id: string
          is_active: boolean | null
          method: string
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          method: string
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          method?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          live_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          live_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          live_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          content_type: string
          content_value: string | null
          created_at: string
          id: string
          page: string
          section: string
          updated_at: string
        }
        Insert: {
          content_key: string
          content_type?: string
          content_value?: string | null
          created_at?: string
          id?: string
          page: string
          section: string
          updated_at?: string
        }
        Update: {
          content_key?: string
          content_type?: string
          content_value?: string | null
          created_at?: string
          id?: string
          page?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_orders: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          id: string
          merchant_id: string
          payment_method: string
          payment_screenshot_url: string | null
          plan_type: string
          sender_number: string
          status: string
          transaction_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string
          id?: string
          merchant_id: string
          payment_method: string
          payment_screenshot_url?: string | null
          plan_type: string
          sender_number: string
          status?: string
          transaction_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          id?: string
          merchant_id?: string
          payment_method?: string
          payment_screenshot_url?: string | null
          plan_type?: string
          sender_number?: string
          status?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      admin_user_view: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          phone: string | null
          profile_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
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
      app_role: "admin" | "client" | "staff" | "manager"
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
      app_role: ["admin", "client", "staff", "manager"],
    },
  },
} as const
