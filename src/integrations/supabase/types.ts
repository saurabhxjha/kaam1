export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          phone: string
          address: string | null
          city: string | null
          bio: string | null
          skills: string | null
          profile_image: string | null
          profile_completed: boolean
          subscription_type: 'free' | 'pro'
          tasks_posted_this_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          phone: string
          address?: string | null
          city?: string | null
          bio?: string | null
          skills?: string | null
          profile_image?: string | null
          profile_completed?: boolean
          subscription_type?: 'free' | 'pro'
          tasks_posted_this_month?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          phone?: string
          address?: string | null
          city?: string | null
          bio?: string | null
          skills?: string | null
          profile_image?: string | null
          profile_completed?: boolean
          subscription_type?: 'free' | 'pro'
          tasks_posted_this_month?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          budget_min: number | null
          budget_max: number | null
          location_lat: number
          location_lng: number
          location_address: string
          category: string | null
          urgency: string
          status: string
          client_id: string
          worker_id: string | null
          assigned_at: string | null
          completed_at: string | null
          expires_at: string
          visibility_radius: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          budget_min?: number | null
          budget_max?: number | null
          location_lat: number
          location_lng: number
          location_address: string
          category?: string | null
          urgency?: string
          status?: string
          client_id: string
          worker_id?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          expires_at?: string
          visibility_radius?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          budget_min?: number | null
          budget_max?: number | null
          location_lat?: number
          location_lng?: number
          location_address?: string
          category?: string | null
          urgency?: string
          status?: string
          client_id?: string
          worker_id?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          expires_at?: string
          visibility_radius?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_bids: {
        Row: {
          id: string
          task_id: string
          worker_id: string
          bid_amount: number | null
          message: string | null
          estimated_completion: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          worker_id: string
          bid_amount?: number | null
          message?: string | null
          estimated_completion?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          worker_id?: string
          bid_amount?: number | null
          message?: string | null
          estimated_completion?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          id: string
          task_id: string
          sender_id: string
          receiver_id: string
          message: string
          message_type: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          sender_id: string
          receiver_id: string
          message: string
          message_type?: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          message_type?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          task_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          review_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          review_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          review_text?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          notification_type: string
          related_task_id: string | null
          related_user_id: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          notification_type: string
          related_task_id?: string | null
          related_user_id?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          notification_type?: string
          related_task_id?: string | null
          related_user_id?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          bio: string | null
          skills: string[] | null
          phone: string | null
          profile_picture: string | null
          location_lat: number | null
          location_lng: number | null
          location_address: string | null
          is_pro: boolean
          subscription_tier: string
          subscription_expires_at: string | null
          rating: number
          total_ratings: number
          tasks_completed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          bio?: string | null
          skills?: string[] | null
          phone?: string | null
          profile_picture?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          is_pro?: boolean
          subscription_tier?: string
          subscription_expires_at?: string | null
          rating?: number
          total_ratings?: number
          tasks_completed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          bio?: string | null
          skills?: string[] | null
          phone?: string | null
          profile_picture?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_address?: string | null
          is_pro?: boolean
          subscription_tier?: string
          subscription_expires_at?: string | null
          rating?: number
          total_ratings?: number
          tasks_completed?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
