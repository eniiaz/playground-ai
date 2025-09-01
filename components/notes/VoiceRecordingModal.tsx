"use client";

import { useState, useRef, useEffect } from "react";
import { StorageService } from "@/lib/storage";
import { useUser } from "@clerk/nextjs";

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (note: { title: string; content: string; tags: string[]; audioUrl?: string }) => void;
}

export function VoiceRecordingModal({ isOpen, onClose, onCreate }: VoiceRecordingModalProps) {
  const { user } = useUser();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // Update recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const resetState = () => {
    setIsRecording(false);
    setIsPaused(false);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsTranscribing(false);
    setIsUploading(false);
    setTranscription("");
    setTitle("");
    setTags("");
    setRecordingTime(0);
    setError(null);
    chunksRef.current = [];
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/openai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setTranscription(data.transcription);
      
      // Auto-generate title from first few words
      if (!title && data.transcription) {
        const words = data.transcription.split(' ').slice(0, 5);
        setTitle(words.join(' ') + (data.transcription.split(' ').length > 5 ? '...' : ''));
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !transcription.trim()) {
      setError('Title and transcription are required');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      let uploadedAudioUrl: string | undefined;

      // Upload audio to Firebase Storage if audio exists
      if (audioBlob && user?.id) {
        const timestamp = Date.now();
        const audioFile = new File([audioBlob], `voice-note-${timestamp}.webm`, {
          type: 'audio/webm'
        });
        
        const storagePath = `voice-notes/${user.id}/${timestamp}.webm`;
        uploadedAudioUrl = await StorageService.uploadFile(storagePath, audioFile);
      }

      // Create the note with transcription and audio URL
      onCreate({
        title: title.trim(),
        content: transcription.trim(),
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
        audioUrl: uploadedAudioUrl,
      });

      resetState();
      onClose();
    } catch (error) {
      console.error('Error creating voice note:', error);
      setError('Failed to save voice note. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">🎤 Voice Note</h2>
            <button
              onClick={() => {
                resetState();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Recording Controls */}
          {!audioBlob && (
            <div className="text-center mb-6">
              <div className="mb-4">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                  isRecording 
                    ? (isPaused ? 'bg-yellow-100' : 'bg-red-100 animate-pulse') 
                    : 'bg-gray-100'
                }`}>
                  <svg className={`w-10 h-10 ${
                    isRecording ? (isPaused ? 'text-yellow-600' : 'text-red-600') : 'text-gray-600'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2v8a1 1 0 102 0V4a1 1 0 100-2H9z"/>
                    <path fillRule="evenodd" d="M4 6a4 4 0 018 0v4a4 4 0 01-8 0V6zM6 6a2 2 0 114 0v4a2 2 0 01-4 0V6z"/>
                  </svg>
                </div>
              </div>

              {isRecording && (
                <div className="mb-4">
                  <div className="text-2xl font-mono text-gray-800 mb-2">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isPaused ? 'Recording paused' : 'Recording...'}
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2v8a1 1 0 102 0V4a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 6a4 4 0 018 0v4a4 4 0 01-8 0V6zM6 6a2 2 0 114 0v4a2 2 0 01-4 0V6z"/>
                    </svg>
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={isPaused ? resumeRecording : pauseRecording}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      {isPaused ? '▶️' : '⏸️'}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      ⏹️ Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Audio Playback & Transcription */}
          {audioBlob && (
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recording ({formatTime(recordingTime)})</h3>
                <audio controls className="w-full">
                  <source src={audioUrl || ''} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={transcribeAudio}
                  disabled={isTranscribing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  {isTranscribing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Transcribing...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Transcribe</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setTranscription("");
                    setTitle("");
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  🔄 Retry
                </button>
              </div>

              {/* Note Creation Form */}
              {transcription && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter note title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="transcription" className="block text-sm font-medium text-gray-700 mb-1">
                      Transcription *
                    </label>
                    <textarea
                      id="transcription"
                      value={transcription}
                      onChange={(e) => setTranscription(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Audio transcription will appear here..."
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. voice, meeting, idea (comma separated)"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <span>💾</span>
                          <span>Save Note</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetState();
                        onClose();
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
