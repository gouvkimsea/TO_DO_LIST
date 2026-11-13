import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Check, X } from 'lucide-react';
import { formatVoiceTranscript } from '../utils/todoLogic';

interface VoiceMicButtonProps {
  currentText: string;
  onUpdateText: (newText: string) => void;
  ariaLabel: string;
  compact?: boolean;
  accentColor?: string;
}

const SAMPLE_DICTATIONS = [
  'Follow up with design team',
  'Schedule dentist checkup',
  'Review quarterly budget',
];

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  currentText,
  onUpdateText,
  ariaLabel,
  compact = false,
  accentColor = '#C87D55',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [dictationDraft, setDictationDraft] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const applyDictation = (spokenText: string) => {
    const formatted = formatVoiceTranscript(currentText, spokenText);
    onUpdateText(formatted);
    stopRecognition();
    setShowPopover(false);
    setDictationDraft('');
  };

  const handleToggleMic = () => {
    if (showPopover) {
      stopRecognition();
      setShowPopover(false);
      return;
    }

    setShowPopover(true);

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const result = event?.results?.[event.results.length - 1];
        const transcript = result?.[0]?.transcript || '';
        if (transcript) {
          setDictationDraft(transcript);
          if (result.isFinal) {
            applyDictation(transcript);
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={handleToggleMic}
        aria-label={ariaLabel}
        aria-pressed={showPopover || isListening}
        title={
          isListening
            ? 'Listening... Click to stop'
            : 'Dictate task with voice'
        }
        className={`rounded-md flex items-center justify-center transition-colors cursor-pointer ${
          compact ? 'w-3.5 h-3.5 p-0.5' : 'w-5 h-5 p-0.5'
        } ${
          showPopover || isListening
            ? 'text-white shadow-xs'
            : 'text-[#B5ADA3] hover:text-[#5A524A] hover:bg-[#F2EFE9]'
        }`}
        style={
          showPopover || isListening
            ? { backgroundColor: accentColor }
            : undefined
        }
      >
        {isListening ? (
          <MicOff className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        ) : (
          <Mic className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        )}
      </button>

      {showPopover && (
        <div
          role="dialog"
          aria-label="Voice dictation input"
          className="absolute right-0 bottom-full mb-1.5 z-30 w-48 sm:w-56 max-w-[calc(100vw-2rem)] bg-white border border-[#E2DAD0] rounded-xl shadow-xl p-2.5 text-left"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C623E] flex items-center gap-1">
              <Mic className="w-3 h-3" />
              {isListening ? 'Listening now...' : 'Voice Dictation'}
            </span>
            <button
              type="button"
              onClick={() => {
                stopRecognition();
                setShowPopover(false);
              }}
              aria-label="Close voice dictation"
              className="text-[#8A8279] hover:text-[#2F2B28] p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (dictationDraft.trim()) {
                applyDictation(dictationDraft);
              }
            }}
            className="flex items-center gap-1 mb-2"
          >
            <input
              type="text"
              value={dictationDraft}
              onChange={(e) => setDictationDraft(e.target.value)}
              placeholder="Speak or type dictated task..."
              aria-label="Dictated task phrase"
              autoFocus
              className="flex-1 min-w-0 text-[11px] bg-[#FAF7F2] border border-[#DED8CE] rounded-lg px-2 py-1 text-[#2F2B28] focus:outline-none focus:border-[#C87D55]"
            />
            <button
              type="submit"
              aria-label="Insert dictated task"
              className="w-6 h-6 rounded-lg text-white flex items-center justify-center shrink-0 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          <div className="space-y-1">
            <span className="text-[9px] font-semibold text-[#9C948B] block">
              Quick voice phrases:
            </span>
            <div className="flex flex-wrap gap-1">
              {SAMPLE_DICTATIONS.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => applyDictation(phrase)}
                  className="text-[10px] bg-[#F5F1EB] hover:bg-[#EBE4DA] text-[#4A433C] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer text-left truncate max-w-full"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
