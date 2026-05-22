'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message } from '@/lib/types'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
  userInitials: string
  onShowSources?: (sources: string[]) => void
  onResubmit?: (newText: string) => void
}

export default function MessageBubble({ message, isStreaming, userInitials, onShowSources, onResubmit }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editVal, setEditVal] = useState(message.content)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isUser && isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      textareaRef.current.focus()
      // Move cursor to the end
      textareaRef.current.selectionStart = textareaRef.current.value.length
    }
  }, [isUser, isEditing])

  const handleSave = () => {
    setIsEditing(false)
    if (editVal.trim() && editVal !== message.content) {
      onResubmit?.(editVal.trim())
    } else {
      setEditVal(message.content)
    }
  }

  const handleCopyUser = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content)
    } catch {}
    setCopyState('copied')
    setTimeout(() => setCopyState('idle'), 3000)
  }, [message.content])

  if (isUser) {
    return (
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex', gap: 10, marginBottom: 22,
          alignItems: 'flex-start', flexDirection: 'row-reverse',
        }}
      >
        {/* User Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--bg-surface-3)', border: '0.5px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: 'var(--gold)', flexShrink: 0,
        }}>
          {userInitials}
        </div>
        
        {/* Bubble Area */}
        <div style={{
          maxWidth: '84%', 
          flex: isEditing ? 1 : undefined,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4
        }}>
          {isEditing ? (
            <div style={{
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border)',
              borderRadius: '12px 3px 12px 12px',
              padding: '12px 16px',
              width: '100%',
            }}>
              <textarea
                ref={textareaRef}
                value={editVal}
                onChange={(e) => {
                  setEditVal(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  outline: 'none', color: 'var(--text-primary)',
                  fontSize: 'var(--chat-font-size, 14px)', lineHeight: 1.7, resize: 'none',
                  fontFamily: 'inherit', minHeight: 48,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button 
                  onClick={() => { setIsEditing(false); setEditVal(message.content) }}
                  style={{ 
                    background: 'var(--bg-primary)', border: '0.5px solid var(--border)', 
                    color: 'var(--text-primary)', cursor: 'pointer', 
                    fontSize: 13, padding: '7px 16px', borderRadius: 20, fontWeight: 500 
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  style={{ 
                    background: 'var(--text-primary)', border: 'none', 
                    color: 'var(--bg-primary)', cursor: 'pointer', 
                    fontSize: 13, padding: '7px 16px', borderRadius: 20, fontWeight: 500 
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px 3px 12px 12px',
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border)',
              fontSize: 'var(--chat-font-size, 14px)', lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap'
            }}>
              {message.content}
            </div>
          )}
          
          {/* Action Row for User (Edit & Copy) */}
          {!isEditing && (
            <div style={{ 
              display: 'flex', gap: 6, 
              opacity: isHovered ? 1 : 0, 
              visibility: isHovered ? 'visible' : 'hidden', 
              transition: 'opacity 0.2s',
              marginTop: 2
            }}>
              <ActionBtn
                onClick={handleCopyUser}
                title={copyState === 'copied' ? 'Copied!' : 'Copy'}
                active={copyState === 'copied'}
                activeColor="#4ade80"
              >
                {copyState === 'copied' ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
                <span style={{ fontSize: 11.5, lineHeight: 1 }}>
                  {copyState === 'copied' ? 'Copied!' : 'Copy'}
                </span>
              </ActionBtn>

              <ActionBtn
                onClick={() => setIsEditing(true)}
                title="Edit message"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span style={{ fontSize: 11.5, lineHeight: 1 }}>Edit</span>
              </ActionBtn>
            </div>
          )}
        </div>
      </div>
    )
  }

  const hasSources =
    !isStreaming &&
    message.metadata?.sources &&
    message.metadata.sources.length > 0

  // AI message
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 22, alignItems: 'flex-start' }}>
      {/* AI Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'var(--gold-faint)', border: '0.5px solid var(--gold-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: 'var(--gold)', flexShrink: 0,
      }}>
        ⚖
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Message Content */}
        <div
          className="prose-lexiq"
          style={{ fontSize: 'var(--chat-font-size, 14px)', lineHeight: 1.75, color: 'var(--text-primary)' }}
        >
          {message.content === '' && isStreaming ? (
            <span className="streaming-cursor" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Thinking...
            </span>
          ) : (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p style={{ margin: '6px 0', color: 'var(--text-primary)' }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ color: 'var(--gold)', fontWeight: 700 }}>{children}</strong>,
                  em: ({ children }) => <em style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{children}</em>,
                  ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '8px 0', color: 'var(--text-primary)' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '8px 0', color: 'var(--text-primary)' }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: '4px 0', color: 'var(--text-primary)' }}>{children}</li>,
                  h1: ({ children }) => <h1 style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif', marginTop: 16, marginBottom: 8, fontSize: 18, fontWeight: 700 }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif', marginTop: 14, marginBottom: 6, fontSize: 16, fontWeight: 700 }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif', marginTop: 12, marginBottom: 4, fontSize: 14, fontWeight: 700 }}>{children}</h3>,
                  code: ({ children }) => (
                    <code style={{ background: 'var(--bg-surface-2)', border: '0.5px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 12, fontFamily: 'monospace', color: 'var(--gold-light)' }}>
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre style={{ background: 'var(--bg-surface-2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '12px 16px', overflowX: 'auto', margin: '8px 0' }}>
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote style={{ borderLeft: '3px solid var(--gold-border)', paddingLeft: 12, color: 'var(--text-muted)', margin: '8px 0', fontStyle: 'italic' }}>
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && <span className="streaming-cursor" />}
            </>
          )}
        </div>

        {/* ── Bottom Row: Actions + Sources Button ── */}
        {!isStreaming && message.content && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {/* Action Buttons */}
            <ActionRow content={message.content} />

            {/* Sources Pill — only shown when sources exist */}
            {hasSources && onShowSources && (
              <SourcesPill
                count={message.metadata.sources!.length}
                onClick={() => onShowSources(message.metadata.sources!)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Action Row ────────────────────────────────────────────────────────────────

function ActionRow({ content }: { content: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [likeState, setLikeState] = useState<'idle' | 'active'>('idle')
  const [dislikeState, setDislikeState] = useState<'idle' | 'active'>('idle')
  const [shareState, setShareState] = useState<'idle' | 'shared'>('idle')
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = content
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopyState('copied')
    setTimeout(() => setCopyState('idle'), 3000)
  }, [content])

  // ── Like ──────────────────────────────────────────────────────────────────
  const handleLike = useCallback(() => {
    if (likeState === 'active') return
    setLikeState('active')
    setDislikeState('idle')
    showFeedback('Thanks for your response!', setFeedbackMsg)
  }, [likeState])

  // ── Dislike ───────────────────────────────────────────────────────────────
  const handleDislike = useCallback(() => {
    if (dislikeState === 'active') return
    setDislikeState('active')
    setLikeState('idle')
    showFeedback('Thanks for your feedback!', setFeedbackMsg)
  }, [dislikeState])

  // ── Share — Web Share API → clipboard fallback ─────────────────────────────
  const handleShare = useCallback(async () => {
    const shareText = `[LexIQ — Indian Legal AI]\n\n${content.slice(0, 800)}${content.length > 800 ? '…' : ''}`

    // Try native Web Share API (works on mobile + some desktop)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'LexIQ Legal Response',
          text: shareText,
        })
        setShareState('shared')
        setTimeout(() => setShareState('idle'), 3000)
        return
      } catch {
        // User cancelled share or API unavailable — fall through to clipboard
      }
    }

    // Fallback: copy shareable text to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = shareText
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setShareState('shared')
    showFeedback('Copied to clipboard!', setFeedbackMsg)
    setTimeout(() => setShareState('idle'), 3000)
  }, [content])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {/* Copy */}
      <ActionBtn
        onClick={handleCopy}
        title={copyState === 'copied' ? 'Copied!' : 'Copy response'}
        active={copyState === 'copied'}
        activeColor="#4ade80"
      >
        {copyState === 'copied' ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        <span style={{ fontSize: 11.5, lineHeight: 1 }}>
          {copyState === 'copied' ? 'Copied!' : 'Copy'}
        </span>
      </ActionBtn>

      {/* Like */}
      <ActionBtn
        onClick={handleLike}
        title="Good response"
        active={likeState === 'active'}
        activeColor="var(--gold)"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill={likeState === 'active' ? 'var(--gold)' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
          <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      </ActionBtn>

      {/* Dislike */}
      <ActionBtn
        onClick={handleDislike}
        title="Poor response"
        active={dislikeState === 'active'}
        activeColor="#f87171"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill={dislikeState === 'active' ? '#f87171' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
          <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
      </ActionBtn>

      {/* Share */}
      <ActionBtn
        onClick={handleShare}
        title="Share response"
        active={shareState === 'shared'}
        activeColor="#60a5fa"
      >
        {shareState === 'shared' ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        )}
        <span style={{ fontSize: 11.5, lineHeight: 1 }}>
          {shareState === 'shared' ? 'Shared!' : 'Share'}
        </span>
      </ActionBtn>

      {/* Inline feedback toast */}
      {feedbackMsg && (
        <span style={{
          fontSize: 11, color: 'var(--text-muted)',
          animation: 'fadeInSlideUp 0.2s ease',
          fontStyle: 'italic',
        }}>
          {feedbackMsg}
        </span>
      )}

      <style>{`
        @keyframes fadeInSlideUp {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function showFeedback(msg: string, setter: (v: string | null) => void) {
  setter(msg)
  setTimeout(() => setter(null), 3500)
}

// ── Generic Action Button ─────────────────────────────────────────────────────

function ActionBtn({
  children, onClick, title, active, activeColor,
}: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  active?: boolean
  activeColor?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12,
        color: active ? activeColor ?? 'var(--gold)' : 'var(--text-muted)',
        background: active ? 'var(--gold-faint)' : 'transparent',
        border: active ? `0.5px solid ${activeColor ?? 'var(--gold-border)'}` : '0.5px solid transparent',
        cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
          ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-2)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
          ;(e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
        }
      }}
    >
      {children}
    </button>
  )
}

// ── Sources Pill Button ───────────────────────────────────────────────────────

function SourcesPill({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="View sources"
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', borderRadius: 20,
        border: '0.5px solid var(--border)',
        background: 'transparent',
        cursor: 'pointer',
        fontSize: 11.5, color: 'var(--text-muted)',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.18s',
        marginLeft: 2,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold-border)'
        ;(e.currentTarget as HTMLElement).style.background = 'var(--gold-faint)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--gold)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
      <span>{count} source{count !== 1 ? 's' : ''}</span>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  )
}
