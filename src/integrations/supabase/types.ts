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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          diff: Json | null
          entity: string
          entity_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          diff?: Json | null
          entity: string
          entity_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          diff?: Json | null
          entity?: string
          entity_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          linkedin: string | null
          name: string
          slug: string
          twitter: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          linkedin?: string | null
          name: string
          slug: string
          twitter?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          linkedin?: string | null
          name?: string
          slug?: string
          twitter?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_versions: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          post_id: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data: Json
          id?: string
          post_id: string
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          post_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_versions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          canonical_url: string | null
          content: string
          content_de: string | null
          content_es: string | null
          content_fr: string | null
          content_ru: string | null
          created_at: string
          cta_enabled: boolean | null
          cta_title: string | null
          cta_type: string | null
          cta_url: string | null
          excerpt: string | null
          excerpt_de: string | null
          excerpt_es: string | null
          excerpt_fr: string | null
          excerpt_ru: string | null
          featured: boolean | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_description_de: string | null
          meta_description_es: string | null
          meta_description_fr: string | null
          meta_description_ru: string | null
          meta_robots: string | null
          meta_title: string | null
          meta_title_de: string | null
          meta_title_es: string | null
          meta_title_fr: string | null
          meta_title_ru: string | null
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          published: boolean
          published_at: string | null
          reading_time_mins: number | null
          scheduled_at: string | null
          schema_json_ld: Json | null
          schema_type: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"] | null
          title: string
          title_de: string | null
          title_es: string | null
          title_fr: string | null
          title_ru: string | null
          translation_status: Json | null
          twitter_card: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          canonical_url?: string | null
          content: string
          content_de?: string | null
          content_es?: string | null
          content_fr?: string | null
          content_ru?: string | null
          created_at?: string
          cta_enabled?: boolean | null
          cta_title?: string | null
          cta_type?: string | null
          cta_url?: string | null
          excerpt?: string | null
          excerpt_de?: string | null
          excerpt_es?: string | null
          excerpt_fr?: string | null
          excerpt_ru?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_description_de?: string | null
          meta_description_es?: string | null
          meta_description_fr?: string | null
          meta_description_ru?: string | null
          meta_robots?: string | null
          meta_title?: string | null
          meta_title_de?: string | null
          meta_title_es?: string | null
          meta_title_fr?: string | null
          meta_title_ru?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          reading_time_mins?: number | null
          scheduled_at?: string | null
          schema_json_ld?: Json | null
          schema_type?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"] | null
          title: string
          title_de?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_ru?: string | null
          translation_status?: Json | null
          twitter_card?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          canonical_url?: string | null
          content?: string
          content_de?: string | null
          content_es?: string | null
          content_fr?: string | null
          content_ru?: string | null
          created_at?: string
          cta_enabled?: boolean | null
          cta_title?: string | null
          cta_type?: string | null
          cta_url?: string | null
          excerpt?: string | null
          excerpt_de?: string | null
          excerpt_es?: string | null
          excerpt_fr?: string | null
          excerpt_ru?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_description_de?: string | null
          meta_description_es?: string | null
          meta_description_fr?: string | null
          meta_description_ru?: string | null
          meta_robots?: string | null
          meta_title?: string | null
          meta_title_de?: string | null
          meta_title_es?: string | null
          meta_title_fr?: string | null
          meta_title_ru?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          published?: boolean
          published_at?: string | null
          reading_time_mins?: number | null
          scheduled_at?: string | null
          schema_json_ld?: Json | null
          schema_type?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          title?: string
          title_de?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_ru?: string | null
          translation_status?: Json | null
          twitter_card?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      checklist_requests: {
        Row: {
          admin_notes: string | null
          asset: string | null
          created_at: string
          email: string
          id: string
          source_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          asset?: string | null
          created_at?: string
          email: string
          id?: string
          source_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          asset?: string | null
          created_at?: string
          email?: string
          id?: string
          source_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          course_url: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          description_de: string | null
          description_es: string | null
          description_fr: string | null
          description_ru: string | null
          duration: string | null
          id: string
          level: string | null
          published: boolean
          slug: string
          tags: string[] | null
          title: string
          title_de: string | null
          title_es: string | null
          title_fr: string | null
          title_ru: string | null
          translation_status: Json | null
          updated_at: string
        }
        Insert: {
          course_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          description_de?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_ru?: string | null
          duration?: string | null
          id?: string
          level?: string | null
          published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          title_de?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_ru?: string | null
          translation_status?: Json | null
          updated_at?: string
        }
        Update: {
          course_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          description_de?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_ru?: string | null
          duration?: string | null
          id?: string
          level?: string | null
          published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          title_de?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_ru?: string | null
          translation_status?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          author: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          description_de: string | null
          description_es: string | null
          description_fr: string | null
          description_ru: string | null
          download_url: string | null
          id: string
          pages: number | null
          published: boolean
          slug: string
          tags: string[] | null
          title: string
          title_de: string | null
          title_es: string | null
          title_fr: string | null
          title_ru: string | null
          translation_status: Json | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          description_de?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_ru?: string | null
          download_url?: string | null
          id?: string
          pages?: number | null
          published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          title_de?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_ru?: string | null
          translation_status?: Json | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          description_de?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_ru?: string | null
          download_url?: string | null
          id?: string
          pages?: number | null
          published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          title_de?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_ru?: string | null
          translation_status?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          answer_de: string | null
          answer_es: string | null
          answer_fr: string | null
          answer_ru: string | null
          category: string | null
          created_at: string
          id: string
          order_index: number | null
          published: boolean
          question: string
          question_de: string | null
          question_es: string | null
          question_fr: string | null
          question_ru: string | null
          translation_status: Json | null
          updated_at: string
        }
        Insert: {
          answer: string
          answer_de?: string | null
          answer_es?: string | null
          answer_fr?: string | null
          answer_ru?: string | null
          category?: string | null
          created_at?: string
          id?: string
          order_index?: number | null
          published?: boolean
          question: string
          question_de?: string | null
          question_es?: string | null
          question_fr?: string | null
          question_ru?: string | null
          translation_status?: Json | null
          updated_at?: string
        }
        Update: {
          answer?: string
          answer_de?: string | null
          answer_es?: string | null
          answer_fr?: string | null
          answer_ru?: string | null
          category?: string | null
          created_at?: string
          id?: string
          order_index?: number | null
          published?: boolean
          question?: string
          question_de?: string | null
          question_es?: string | null
          question_fr?: string | null
          question_ru?: string | null
          translation_status?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          description_de: string | null
          description_es: string | null
          description_fr: string | null
          description_ru: string | null
          id: string
          material_url: string | null
          published: boolean
          slug: string
          tags: string[] | null
          title: string
          title_de: string | null
          title_es: string | null
          title_fr: string | null
          title_ru: string | null
          topic: string | null
          translation_status: Json | null
          type: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          description_de?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_ru?: string | null
          id?: string
          material_url?: string | null
          published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          title_de?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_ru?: string | null
          topic?: string | null
          translation_status?: Json | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          description_de?: string | null
          description_es?: string | null
          description_fr?: string | null
          description_ru?: string | null
          id?: string
          material_url?: string | null
          published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          title_de?: string | null
          title_es?: string | null
          title_fr?: string | null
          title_ru?: string | null
          topic?: string | null
          translation_status?: Json | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt: string | null
          created_at: string
          credit: string | null
          folder: string | null
          height: number | null
          id: string
          optimized_size: number | null
          order_index: number | null
          original_size: number | null
          sizes: Json | null
          url: string
          used_in: Json | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          created_at?: string
          credit?: string | null
          folder?: string | null
          height?: number | null
          id?: string
          optimized_size?: number | null
          order_index?: number | null
          original_size?: number | null
          sizes?: Json | null
          url: string
          used_in?: Json | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          created_at?: string
          credit?: string | null
          folder?: string | null
          height?: number | null
          id?: string
          optimized_size?: number | null
          order_index?: number | null
          original_size?: number | null
          sizes?: Json | null
          url?: string
          used_in?: Json | null
          width?: number | null
        }
        Relationships: []
      }
      mentorship_applications: {
        Row: {
          admin_notes: string | null
          availability: string
          created_at: string
          email: string
          experience: string
          goals: string
          id: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          availability: string
          created_at?: string
          email: string
          experience: string
          goals: string
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          availability?: string
          created_at?: string
          email?: string
          experience?: string
          goals?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mpesa_transactions: {
        Row: {
          account_reference: string | null
          amount: number | null
          callback_payload: Json | null
          created_at: string
          description: string | null
          id: string
          phone: string | null
          request_payload: Json | null
          response_payload: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          account_reference?: string | null
          amount?: number | null
          callback_payload?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          phone?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_reference?: string | null
          amount?: number | null
          callback_payload?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          phone?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          source_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          source_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          source_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      post_authors: {
        Row: {
          author_id: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_authors_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          category_id: string
          id: string
          post_id: string
        }
        Insert: {
          category_id: string
          id?: string
          post_id: string
        }
        Update: {
          category_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_related: {
        Row: {
          id: string
          post_id: string
          related_post_id: string
        }
        Insert: {
          id?: string
          post_id: string
          related_post_id: string
        }
        Update: {
          id?: string
          post_id?: string
          related_post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_related_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_related_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          id: string
          post_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          post_id: string
          tag_id: string
        }
        Update: {
          id?: string
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      redirects: {
        Row: {
          code: number | null
          created_at: string
          from_path: string
          id: string
          to_url: string
        }
        Insert: {
          code?: number | null
          created_at?: string
          from_path: string
          id?: string
          to_url: string
        }
        Update: {
          code?: number | null
          created_at?: string
          from_path?: string
          id?: string
          to_url?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_registrations: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          source_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          source_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          source_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          ga4_id: string | null
          gtm_id: string | null
          id: string
          robots_content: string | null
          seo_default_description: string | null
          seo_default_og_image: string | null
          seo_title_suffix: string | null
          sitemap_enabled: boolean | null
          social_links: Json | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          ga4_id?: string | null
          gtm_id?: string | null
          id?: string
          robots_content?: string | null
          seo_default_description?: string | null
          seo_default_og_image?: string | null
          seo_title_suffix?: string | null
          sitemap_enabled?: boolean | null
          social_links?: Json | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          ga4_id?: string | null
          gtm_id?: string | null
          id?: string
          robots_content?: string | null
          seo_default_description?: string | null
          seo_default_og_image?: string | null
          seo_title_suffix?: string | null
          sitemap_enabled?: boolean | null
          social_links?: Json | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
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
      admin_mpesa_transactions: {
        Row: {
          account_reference: string | null
          amount: number | null
          callback_payload: Json | null
          created_at: string | null
          description: string | null
          id: string | null
          phone: string | null
          request_payload: Json | null
          response_payload: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_reference?: string | null
          amount?: number | null
          callback_payload?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          phone?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_reference?: string | null
          amount?: number | null
          callback_payload?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          phone?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_analytics_settings: {
        Args: never
        Returns: {
          ga4_id: string
          gtm_id: string
        }[]
      }
      get_contact_settings: {
        Args: never
        Returns: {
          whatsapp_number: string
        }[]
      }
      get_public_site_settings: {
        Args: never
        Returns: {
          robots_content: string
          seo_default_description: string
          seo_default_og_image: string
          seo_title_suffix: string
          sitemap_enabled: boolean
        }[]
      }
      get_resource_signed_url: { Args: { file_path: string }; Returns: string }
      grant_role_by_email: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      list_all_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      list_auth_users: {
        Args: never
        Returns: {
          display_name: string
          email: string
          id: string
        }[]
      }
      publish_post: { Args: { _post_id: string }; Returns: undefined }
      revoke_role_by_email: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      schedule_post: {
        Args: { _post_id: string; _scheduled_at: string }
        Returns: undefined
      }
      unpublish_post: { Args: { _post_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor" | "viewer"
      post_status:
        | "draft"
        | "in_review"
        | "scheduled"
        | "published"
        | "archived"
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
      app_role: ["super_admin", "admin", "editor", "viewer"],
      post_status: ["draft", "in_review", "scheduled", "published", "archived"],
    },
  },
} as const
