/**
 * Represents a chat message in the conversation
 */
export interface Message {
  /** Unique identifier for the message */
  id: number
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'system'
  /** Content of the message */
  content: string
  /** Flag indicating if the message has been edited */
  edited?: boolean
}

/**
 * Settings for the application
 */
export interface Settings {
  /** API key for OpenAI */
  apiKey: string
  /** Model to use for chat completions */
  model: string
  /** Theme preference */
  theme: 'light' | 'dark' | 'system'
}

/**
 * Conversation data structure for storage
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: string
  /** Title of the conversation */
  title: string
  /** Messages in the conversation */
  messages: Message[]
  /** Timestamp of last update */
  updatedAt: number
  /** Timestamp of creation */
  createdAt: number
}
