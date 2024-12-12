import React from 'react';
import { Conversation } from '../types';

interface Props {
  conversations: Conversation[];
}

export const ChatHistory: React.FC<Props> = ({ conversations }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl p-4">
      {conversations.map((conv, index) => (
        <div key={conv.id || index} className="flex flex-col gap-2">
          <div className="bg-blue-100 p-3 rounded-lg self-end max-w-[80%]">
            {conv.userInput}
          </div>
          <div className="bg-gray-100 p-3 rounded-lg self-start max-w-[80%]">
            {conv.assistantResponse}
          </div>
        </div>
      ))}
    </div>
  );
};