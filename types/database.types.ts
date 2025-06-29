export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
          userId: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          userId: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          userId?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          expires: string
          sessionToken: string
          userId: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          expires: string
          sessionToken: string
          userId: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          expires?: string
          sessionToken?: string
          userId?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      verification_tokens: {
        Row: {
          identifier: string
          token: string
          expires: string
          created_at: string
          updated_at: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          content: string
          created_at: string
          id: string
          status: boolean
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          status?: boolean
          title: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          status?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      instruments: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          id: number
          title: string
          user_id: string
        }
        Insert: {
          content: string
          id?: number
          title: string
          user_id?: string
        }
        Update: {
          content?: string
          id?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      planets: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          id: string
          plan_active: boolean
          plan_expires: number | null
          stripe_customer_id: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          plan_active?: boolean
          plan_expires?: number | null
          stripe_customer_id: string
          subscription_id?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          plan_active?: boolean
          plan_expires?: number | null
          stripe_customer_id?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string | null
          emailVerified: string | null
          id: string
          image: string | null
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          email?: string | null
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          emailVerified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users_clerk: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          updated_at: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          metadata?: Json | null
          updated_at?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          updated_at?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      pod_resource: {
        Row: {
          id: number
          resource_path: string
          resource_type: string
          status: string
          bsv_tx_hash: string | null
          overlay_topic: string | null
          pod_url: string
          content_hash: string | null
          description: string | null
          mime_type: string | null
          resource_size: number | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: never
          resource_path: string
          resource_type: string
          status: string
          bsv_tx_hash?: string | null
          overlay_topic?: string | null
          pod_url: string
          content_hash?: string | null
          description?: string | null
          mime_type?: string | null
          resource_size?: number | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: never
          resource_path?: string
          resource_type?: string
          status?: string
          bsv_tx_hash?: string | null
          overlay_topic?: string | null
          pod_url?: string
          content_hash?: string | null
          description?: string | null
          mime_type?: string | null
          resource_size?: number | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      identity: {
        Row: {
          id: number
          solid_pod_url: string
          did: string
          did_document: Json | null
          did_bsv_hash: string | null
          did_overlay_topic: string | null
          vc: Json | null
          vc_bsv_hash: string | null
          vc_overlay_topic: string | null
          connection_status: string | null
          access_token: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: never
          solid_pod_url: string
          did: string
          did_document?: Json | null
          did_bsv_hash?: string | null
          did_overlay_topic?: string | null
          vc?: Json | null
          vc_bsv_hash?: string | null
          vc_overlay_topic?: string | null
          connection_status?: string | null
          access_token?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: never
          solid_pod_url?: string
          did?: string
          did_document?: Json | null
          did_bsv_hash?: string | null
          did_overlay_topic?: string | null
          vc?: Json | null
          vc_bsv_hash?: string | null
          vc_overlay_topic?: string | null
          connection_status?: string | null
          access_token?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bsv_attestation: {
        Row: {
          id: number
          resource_id: number | null
          identity_id: number | null
          attestation_type: string
          tx_hash: string
          overlay_topic: string | null
          content_hash: string
          timestamp_proof: Json | null
          wallet_address: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: never
          resource_id?: number | null
          identity_id?: number | null
          attestation_type: string
          tx_hash: string
          overlay_topic?: string | null
          content_hash: string
          timestamp_proof?: Json | null
          wallet_address?: string | null
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: never
          resource_id?: number | null
          identity_id?: number | null
          attestation_type?: string
          tx_hash?: string
          overlay_topic?: string | null
          content_hash?: string
          timestamp_proof?: Json | null
          wallet_address?: string | null
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bsv_attestation_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "pod_resource"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bsv_attestation_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "identity"
            referencedColumns: ["id"]
          }
        ]
      }
      context_entry: {
        Row: {
          id: number
          title: string
          content: string
          content_type: string
          tags: string[] | null
          metadata: Json | null
          pod_resource_id: number | null
          bsv_tx_hash: string | null
          overlay_topic: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: never
          title: string
          content: string
          content_type?: string
          tags?: string[] | null
          metadata?: Json | null
          pod_resource_id?: number | null
          bsv_tx_hash?: string | null
          overlay_topic?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          id?: never
          title?: string
          content?: string
          content_type?: string
          tags?: string[] | null
          metadata?: Json | null
          pod_resource_id?: number | null
          bsv_tx_hash?: string | null
          overlay_topic?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "context_entry_pod_resource_id_fkey"
            columns: ["pod_resource_id"]
            isOneToOne: false
            referencedRelation: "pod_resource"
            referencedColumns: ["id"]
          }
        ]
      }
      shared_resource: {
        Row: {
          id: number
          resource_type: string
          resource_id: number
          
          // General sharing fields
          shared_with_user_id: string | null
          shared_with_public: boolean | null
          requires_payment: boolean | null
          description: string | null
          access_limit: number | null
          expiry_date: string | null
          
          // Payment fields
          price_per_access: number | null
          price_currency: string | null
          price_satoshis: number | null
          
          // BSV/Overlay specific fields
          overlay_topic: string | null
          access_policy: Json | null
          payment_address: string | null
          
          // Stats
          total_access_count: number | null
          total_earnings_satoshis: number | null
          is_active: boolean | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: never
          resource_type: string
          resource_id: number
          
          // General sharing fields
          shared_with_user_id?: string | null
          shared_with_public?: boolean | null
          requires_payment?: boolean | null
          description?: string | null
          access_limit?: number | null
          expiry_date?: string | null
          
          // Payment fields
          price_per_access?: number | null
          price_currency?: string | null
          price_satoshis?: number | null
          
          // BSV/Overlay specific fields
          overlay_topic?: string | null
          access_policy?: Json | null
          payment_address?: string | null
          
          // Stats
          total_access_count?: number | null
          total_earnings_satoshis?: number | null
          is_active?: boolean | null
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: never
          resource_type?: string
          resource_id?: number
          
          // General sharing fields
          shared_with_user_id?: string | null
          shared_with_public?: boolean | null
          requires_payment?: boolean | null
          description?: string | null
          access_limit?: number | null
          expiry_date?: string | null
          
          // Payment fields
          price_per_access?: number | null
          price_currency?: string | null
          price_satoshis?: number | null
          
          // BSV/Overlay specific fields
          overlay_topic?: string | null
          access_policy?: Json | null
          payment_address?: string | null
          
          // Stats
          total_access_count?: number | null
          total_earnings_satoshis?: number | null
          is_active?: boolean | null
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      micropayment: {
        Row: {
          id: number
          shared_resource_id: number
          buyer_user_id: string
          seller_user_id: string
          amount_satoshis: number
          tx_hash: string
          payment_status: string
          access_granted: boolean | null
          access_expires_at: string | null
          created_at: string
          confirmed_at: string | null
        }
        Insert: {
          id?: never
          shared_resource_id: number
          buyer_user_id: string
          seller_user_id: string
          amount_satoshis: number
          tx_hash: string
          payment_status: string
          access_granted?: boolean | null
          access_expires_at?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
        Update: {
          id?: never
          shared_resource_id?: number
          buyer_user_id?: string
          seller_user_id?: string
          amount_satoshis?: number
          tx_hash?: string
          payment_status?: string
          access_granted?: boolean | null
          access_expires_at?: string | null
          created_at?: string
          confirmed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "micropayment_shared_resource_id_fkey"
            columns: ["shared_resource_id"]
            isOneToOne: false
            referencedRelation: "shared_resource"
            referencedColumns: ["id"]
          }
        ]
      }
      overlay_sync: {
        Row: {
          id: number
          sync_type: string
          reference_id: number
          overlay_topic: string
          tx_hash: string | null
          sync_status: string
          sync_data: Json | null
          last_sync_at: string | null
          retry_count: number | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: never
          sync_type: string
          reference_id: number
          overlay_topic: string
          tx_hash?: string | null
          sync_status: string
          sync_data?: Json | null
          last_sync_at?: string | null
          retry_count?: number | null
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: never
          sync_type?: string
          reference_id?: number
          overlay_topic?: string
          tx_hash?: string | null
          sync_status?: string
          sync_data?: Json | null
          last_sync_at?: string | null
          retry_count?: number | null
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
