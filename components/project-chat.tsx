"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { AiChat } from "@/components/ai-chat"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectChatProps {
  projectSlug: string
}

export function ProjectChat({ projectSlug }: ProjectChatProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('slug', projectSlug)
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Project not found')
          } else {
            throw fetchError
          }
          return
        }

        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (projectSlug) {
      fetchProject()
    }
  }, [projectSlug])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-sidebar-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sidebar-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-sidebar-foreground mb-2 font-general">
            {error === 'Project not found' ? 'Chatbot Not Found' : 'Error'}
          </h2>
          <p className="text-sidebar-foreground/70 mb-4">
            {error === 'Project not found' 
              ? 'The chatbot you\'re looking for doesn\'t exist. Check Discover to explore our library of chatbots.'
              : error
            }
          </p>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/dashboard/discover')
              window.dispatchEvent(new PopStateEvent('popstate'))
            }}
            className="px-4 py-2 bg-sidebar-foreground text-sidebar rounded-lg hover:bg-sidebar-foreground/90 transition-colors"
          >
            Discover Chatbots
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden bg-background">
      {/* Chat Header */}
      <div className="border-b border-sidebar-border p-4 bg-background flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-sidebar-foreground font-general">
              {project.name}
            </h1>
            <p className="text-sm text-sidebar-foreground/70">
              {project.description}
            </p>
          </div>
          <div className="text-xs text-sidebar-foreground/50">
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