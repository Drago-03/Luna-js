import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Props {
  onInputReceived: (input: string) => void;
}

export const VoiceInput: React.FC<Props> = ({ onInputReceived }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !listening) {
      onInputReceived(transcript);
      resetTranscript();
    }
  }, [transcript, listening]);

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => SpeechRecognition.startListening()}
        className={`px-6 py-3 rounded-full ${
          listening ? 'bg-red-500' : 'bg-blue-500'
        } text-white font-semibold`}
      >
        {listening ? 'Listening...' : 'Start Speaking'}
      </button>
      {transcript && (
        <div className="text-gray-600">
          {transcript}
        </div>
      )}
    </div>
  );
};