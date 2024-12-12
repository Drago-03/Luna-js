export interface Command {
  intent: string;
  action: () => Promise<void>;
}

export interface Conversation {
  id?: number;
  timestamp: number;
  userInput: string;
  assistantResponse: string;
}