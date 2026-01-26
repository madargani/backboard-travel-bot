declare module 'backboard-sdk' {
  export interface BackboardClientOptions {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
  }

  export interface Assistant {
    assistantId: string;
    name: string;
    description?: string;
    tools: Tool[] | null;
    embedding_provider?: string;
    embedding_model_name?: string;
    embedding_dims?: number;
    createdAt: Date;
  }

  export interface Message {
    messageId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
    status: string;
    metadata?: any;
    attachments?: AttachmentInfo[];
  }

  export interface Thread {
    threadId: string;
    createdAt: Date;
    messages: Message[];
    metadata?: any;
    latestMessage?: LatestMessageInfo;
  }

  export interface MessageResponse {
    message: string;
    threadId: string;
    content: string;
    messageId: string;
    role: 'user' | 'assistant' | 'system';
    status: string;
    runId?: string;
    modelProvider?: string;
    modelName?: string;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    createdAt: Date | null;
    attachments?: AttachmentInfo[];
    timestamp: Date;
  }

  export interface Tool {
    type: string;
    function: {
      name: string;
      description?: string;
      parameters: any;
    };
  }

  export interface AttachmentInfo {
    documentId?: string;
    filename: string;
    status: string;
    fileSizeBytes?: number;
    summary?: string;
  }

  export interface LatestMessageInfo {
    metadata?: any;
    modelProvider?: string;
    modelName?: string;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    createdAt: Date | null;
  }

  export type StreamChunk =
    | { type: 'content_streaming'; content: string }
    | { type: 'error'; error: string }
    | { type: 'run_failed'; error: string }
    | { type: 'run_ended'; status: string };

  export class BackboardError extends Error {
    name: 'BackboardError';
    constructor(message: string);
  }

  export class BackboardAPIError extends BackboardError {
    name: 'BackboardAPIError';
    statusCode?: number;
    response?: any;
    constructor(message: string, statusCode?: number, response?: any);
  }

  export class BackboardValidationError extends BackboardAPIError {
    name: 'BackboardValidationError';
    constructor(message: string, statusCode?: number, response?: any);
  }

  export class BackboardNotFoundError extends BackboardAPIError {
    name: 'BackboardNotFoundError';
    constructor(message: string, statusCode?: number, response?: any);
  }

  export class BackboardRateLimitError extends BackboardAPIError {
    name: 'BackboardRateLimitError';
    constructor(message: string, statusCode?: number, response?: any);
  }

  export class BackboardServerError extends BackboardAPIError {
    name: 'BackboardServerError';
    constructor(message: string, statusCode?: number, response?: any);
  }

  export class BackboardClient {
    constructor(options: BackboardClientOptions);
    createAssistant(options: { name: string; description?: string; system_prompt?: string; tools?: Tool[]; embedding_provider?: string; embedding_model_name?: string; embedding_dims?: number }): Promise<Assistant>;
    listAssistants(options?: { skip?: number; limit?: number }): Promise<Assistant[]>;
    getAssistant(assistantId: string): Promise<Assistant>;
    updateAssistant(assistantId: string, options: { name?: string; description?: string; tools?: Tool[] }): Promise<Assistant>;
    deleteAssistant(assistantId: string): Promise<any>;
    createThread(assistantId: string): Promise<Thread>;
    listThreads(options?: { skip?: number; limit?: number }): Promise<Thread[]>;
    getThread(threadId: string): Promise<Thread>;
    deleteThread(threadId: string): Promise<any>;
    addMessage(threadId: string, options?: { content?: string; files?: string[]; llm_provider?: string; model_name?: string; stream?: boolean; memory?: string }): Promise<MessageResponse> | AsyncGenerator<StreamChunk, any, any>;
  }
}