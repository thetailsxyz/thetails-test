"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ArrowLeftIcon } from "lucide-react"
import { AiChat } from "@/components/ai-chat"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Project = Database['public']['Tables']['projects']['Row']

interface ChatSlugPageProps {
  params: { slug: string }
}

export default function ChatSlugPage({ params }: ChatSlugPageProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to find project by custom_slug first, then by slug
        let { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('custom_slug', params.slug)
          .eq('is_public', true)
          .single()

        // If not found by custom_slug, try by regular slug
        if (fetchError && fetchError.code === 'PGRST116') {
          const { data: slugData, error: slugError } = await supabase
            .from('projects')
            .select('*')
            .eq('slug', params.slug)
            .eq('is_public', true)
            .single()

          if (slugError) {
            if (slugError.code === 'PGRST116') {
              setError('Chatbot not found or not publicly available')
            } else {
              throw slugError
            }
            return
          }

          data = slugData
        } else if (fetchError) {
          throw fetchError
        }

        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchProject()
    }
  }, [params.slug])

  const handleBackToDiscover = () => {
    window.location.href = '/chat'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sidebar-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-sidebar-foreground mb-2 font-general">
            {error === 'Chatbot not found or not publicly available' ? 'Chatbot Not Found' : 'Error'}
          </h2>
          <p className="text-sidebar-foreground/70 mb-4">
            {error === 'Chatbot not found or not publicly available' 
              ? 'The chatbot you\'re looking for doesn\'t exist or is not publicly available.'
              : error
            }
          </p>
          <Button
            onClick={handleBackToDiscover}
            className="bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Discover
          </Button>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden bg-background">
      {/* Chat Header */}
      <div className="border-b border-sidebar-border p-4 bg-background flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToDiscover}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-sidebar-foreground font-general">
                {project.name}
              </h1>
              <p className="text-sm text-sidebar-foreground/70">
                {project.description}
              </p>
            </div>
          </div>
          <div className="text-xs text-sidebar-foreground/50 font-general">
            Powered by AI
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 min-h-0">
        <AiChat />
      </div>
    </div>
  )
}