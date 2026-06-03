import React, { useState, useEffect } from 'react';
import { Smartphone, Eye, EyeOff, Lock, ShieldAlert } from 'lucide-react';

interface LyricsPacket {
  text: string;
  isBlackout: boolean;
  isTextCleared: boolean;
  copyright?: string;
}

export default function MobileRemote() {
  const [pinInput, setPinInput] = useState('');
  const [isPaired, setIsPaired] = useState(() => {
    return localStorage.getItem('remote_paired_state') === 'true';
  });
  const [pairingError, setPairingError] = useState<string | null>(null);

  // Live lyrics and status synced from main window
  const [packet, setPacket] = useState<LyricsPacket>(() => {
    const saved = localStorage.getItem('lyrics_last_projection_packet');
    return saved ? JSON.parse(saved) : { text: 'Welcome to DALYRIC remote. Waiting for slide...', isBlackout: false, isTextCleared: false };
  });

  // Load correct preset PIN from localStorage
  const getExpectedPin = (): string => {
    return localStorage.getItem('remote_pairing_pin') || '8451';
  };

  const handlePair = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = getExpectedPin();
    if (pinInput.trim() === expected) {
      setIsPaired(true);
      setPairingError(null);
      localStorage.setItem('remote_paired_state', 'true');
    } else {
      setPairingError('Invalid DALYRIC Pairing PIN. Please check the Customization Panel in active Studio tab.');
      setIsPaired(false);
    }
  };

  useEffect(() => {
    if (!isPaired) return;

    // Sync in real-time with BroadcastChannel
    const channel = new BroadcastChannel('lyrics_projection_channel');
    channel.onmessage = (msgEvent) => {
      if (msgEvent.data) {
        setPacket(msgEvent.data);
      }
    };

    // Ping main window on first mount to request update
    const remoteChannel = new BroadcastChannel('lyrics_remote_channel');
    remoteChannel.postMessage({ type: 'PING' });

    // Periodically update packet from localStorage if fallback needed
    const interval = setInterval(() => {
      const saved = localStorage.getItem('lyrics_last_projection_packet');
      if (saved) {
        setPacket(JSON.parse(saved));
      }
    }, 1000);

    return () => {
      channel.close();
      remoteChannel.close();
      clearInterval(interval);
    };
  }, [isPaired]);

  const sendRemoteCommand = (actionType: 'NEXT_SLIDE' | 'PREV_SLIDE' | 'TOGGLE_CLEAR' | 'TOGGLE_BLACKOUT' | 'FORCE_CLEAR' | 'FORCE_BLACKOUT', value?: boolean) => {
    try {
      const channel = new BroadcastChannel('lyrics_remote_channel');
      channel.postMessage({ type: actionType, value });
      channel.close();
    } catch (e) {
      console.warn('Unable to send remote BroadcastCommand:', e);
    }

    // Speculatively update local preview to feel instantly interactive and tactile
    if (actionType === 'TOGGLE_CLEAR') {
      setPacket(prev => ({ ...prev, isTextCleared: !prev.isTextCleared }));
    } else if (actionType === 'TOGGLE_BLACKOUT') {
      setPacket(prev => ({ ...prev, isBlackout: !prev.isBlackout }));
    } else if (actionType === 'FORCE_CLEAR') {
      setPacket(prev => ({ ...prev, isTextCleared: value || false }));
    } else if (actionType === 'FORCE_BLACKOUT') {
      setPacket(prev => ({ ...prev, isBlackout: value || false }));
    }
  };

  // ----------------------------------
  // PART A: PIN UNLOCK CHALLENGE VIEW
  // ----------------------------------
  if (!isPaired) {
    return (
      <div className="w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-100 font-sans" id="remote-login-screen">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-850 p-6 rounded-2xl shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-display font-black tracking-wider uppercase bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                DALYRIC Stage Remote
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-mono uppercase tracking-widest font-extrabold text-[9px]">
                PIN Pairing Authorization Required
              </p>
            </div>
          </div>

          <form onSubmit={handlePair} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-455 uppercase tracking-wider block">
                Enter Pairing PIN (4-Digits)
              </label>
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={4}
                required
                placeholder="0 0 0 0"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/60 border border-zinc-805 text-center text-2xl font-mono tracking-[0.4em] py-3.5 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-all focus:ring-1 focus:ring-orange-500/30"
                autoComplete="off"
              />
            </div>

            {pairingError && (
              <div className="p-3 bg-rose-955/20 border border-rose-900/40 text-rose-400 rounded-xl flex items-start gap-2 text-[11px] font-sans leading-normal">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{pairingError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:brightness-110 active:scale-[0.98] text-black font-semibold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md select-none flex items-center justify-center gap-1 font-sans"
            >
              <span>Verify & Connect</span>
            </button>
          </form>

          <p className="text-[10px] text-zinc-500 text-center font-sans max-w-sm mx-auto leading-relaxed">
            Locate the pairing PIN under the "Mobile Remote" control manager of the Active Studio Customization Panel.
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------
  // PART B: REMOTE CONTROLS SCREEN
  // ----------------------------------
  const isOutputOff = packet.isBlackout || packet.isTextCleared;

  return (
    <div className="w-screen h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-hidden" id="remote-dashboard-screen">
      
      {/* Upper Status Line */}
      <header className="px-5 py-4 bg-neutral-950 border-b border-zinc-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-450">
            DALYRIC Studio Remote
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[9px] font-mono text-emerald-450 uppercase font-black tracking-wider">
            Connected to Live
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-5 flex flex-col justify-between min-h-0 space-y-4">
        
        {/* UPPER WINDOW: Teleprompter / Status Screen Viewer */}
        <div className="flex-1 rounded-2xl border border-zinc-850/80 bg-zinc-900/45 p-4 flex flex-col justify-between relative shadow-lg overflow-hidden shrink-0">
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            <span className={`w-1.5 h-1.5 rounded-full ${isOutputOff ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-zinc-500">
              {packet.isBlackout ? 'BLACKOUT' : packet.isTextCleared ? 'TEXT CLEARED' : 'TELEPROMPTER MONITOR'}
            </span>
          </div>

          {/* Large text display area */}
          <div className="flex-1 flex items-center justify-center min-h-0 py-6">
            <p className={`text-center font-sans font-bold leading-normal transition-all duration-300 tracking-wide overflow-y-auto w-full max-h-full px-2
              ${isOutputOff ? 'text-zinc-600 line-through opacity-45 text-sm italic' : 'text-zinc-100 text-lg md:text-xl'}
            `}>
              {packet.isBlackout ? '[BLACKOUT ACTIVE]' : packet.isTextCleared ? '[TEXT IS CLEARED]' : (packet.text ? packet.text : '[EMPTY STAGE]')}
            </p>
          </div>

          {packet.copyright && !isOutputOff && (
            <p className="text-[8px] font-mono text-zinc-550 uppercase text-center w-full truncate border-t border-zinc-900 pt-1.5">
              Ref: {packet.copyright}
            </p>
          )}
        </div>

        {/* CONTROLLER MODULE: Tactile Command Triggers */}
        <div className="space-y-3 shrink-0">
          
          {/* Main Action Toggles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Clear toggle */}
            <button
              onClick={() => sendRemoteCommand('TOGGLE_CLEAR')}
              className={`py-4 px-3 rounded-xl border font-sans font-bold text-xs uppercase tracking-wide transition-all focus:outline-none flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:shadow-md active:scale-95 ${
                packet.isTextCleared
                  ? 'bg-amber-950/40 text-amber-400 border-amber-500/35 shadow-amber-950/20 shadow-lg'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800'
              }`}
            >
              {packet.isTextCleared ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              <span>{packet.isTextCleared ? 'Show Lyrics' : 'Clear Screen'}</span>
            </button>

            {/* Blackout toggle */}
            <button
              onClick={() => sendRemoteCommand('TOGGLE_BLACKOUT')}
              className={`py-4 px-3 rounded-xl border font-sans font-bold text-xs uppercase tracking-wide transition-all focus:outline-none flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:shadow-md active:scale-95 ${
                packet.isBlackout
                  ? 'bg-rose-955/55 text-rose-455 border-rose-500/35 shadow-rose-950/20 shadow-lg'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-805'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${packet.isBlackout ? 'text-rose-450 animate-pulse' : 'text-zinc-400'}`} />
              <span>{packet.isBlackout ? 'Exit Blackout' : 'Blackout'}</span>
            </button>
          </div>

          {/* Large touch-friendly Slider Navigation Controls */}
          <div className="grid grid-cols-1 gap-2.5 pt-1">
            
            {/* huge Next button */}
            <button
              onClick={() => sendRemoteCommand('NEXT_SLIDE')}
              className="py-5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:brightness-110 active:scale-[0.98] text-white rounded-2xl font-display font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-xl shadow-orange-950/15 cursor-pointer select-none border border-orange-400/20 flex items-center justify-center gap-2"
            >
              <span>Next Slide</span>
              <span>→</span>
            </button>

            {/* Smaller previous button */}
            <button
              onClick={() => sendRemoteCommand('PREV_SLIDE')}
              className="py-3.5 bg-zinc-900 hover:bg-zinc-850 active:scale-[0.98] text-zinc-350 rounded-xl font-display font-bold text-xs uppercase tracking-widest transition-all cursor-pointer border border-zinc-805 select-none flex items-center justify-center gap-2"
            >
              <span>←</span>
              <span>Prev Slide</span>
            </button>
          </div>

        </div>

        {/* Remote Logout Command Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => {
              setIsPaired(false);
              localStorage.setItem('remote_paired_state', 'false');
            }}
            className="text-[9px] font-mono text-zinc-650 hover:text-rose-400 transition-colors uppercase font-extrabold tracking-widest"
          >
            ❌ Disconnect Session & Lock Remote
          </button>
        </div>

      </div>

    </div>
  );
}
