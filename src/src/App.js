import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import beepSound from './beep.mp3';
import { FaRegImage } from 'react-icons/fa';

const prompts = [
  "What have you been up to today?",
  "What's on your mind?",
  "Write like no one is watching.",
  "What made you smile today?",
  "What are you grateful for?",
  "What's your biggest challenge right now?",
  "What would you like to remember about today?",
  "What are you looking forward to?",
  "What did you learn today?",
  "What's your favorite memory from today?"
];

const fontOptions = [
  { name: 'Lato', label: 'Lato' },
  { name: 'System', label: 'System' },
  { name: 'Serif', label: 'Serif' },
  { name: 'Random', label: 'Random' }
];

const randomFonts = [
  'Lato', 'System', 'Serif', 'Courier New', 'Garamond', 'Bookman', 'Georgia', 'Courier New', 'Noto Serif Kannada', 'Palatino'
];

const colorOptions = [
  { name: 'Black', value: '#222' },
  { name: 'Blue', value: '#4A90E2' },
  { name: 'Red', value: '#E26A6A' },
  { name: 'Green', value: '#6AE29B' },
  { name: 'Orange', value: '#E2A84A' },
];

const { ipcRenderer } = window.require ? window.require('electron') : {};

const CHAT_PROMPT = `below is my journal entry. wyt? talk through it with me like a friend. don't therpaize me and give me a whole breakdown, don't repeat my thoughts with headings. really take all of this, and tell me back stuff truly as if you're an old homie.\n\nKeep it casual, dont say yo, help me make new connections i don't see, comfort, validate, challenge, all of it. dont be afraid to say a lot. format with markdown headings if needed.\n\ndo not just go through every single thing i say, and say it back to me. you need to proccess everythikng is say, make connections i don't see it, and deliver it all back to me as a story that makes me feel what you think i wanna feel. thats what the best therapists do.\n\nideally, you're style/tone should sound like the user themselves. it's as if the user is hearing their own tone but it should still feel different, because you have different things to say and don't just repeat back they say.\n\nelse, start by saying, "hey, thanks for showing me this. my thoughts:"\n    \nmy entry:\n`;

// Helper to map font name to CSS class
const fontClassMap = {
  'Lato': 'lato-font',
  'System': 'system-font',
  'Serif': 'serif-font',
  'Courier New': 'courier-font',
  'Garamond': 'garamond-font',
  'Bookman': 'bookman-font',
  'Georgia': 'georgia-font',
  'Noto Serif Kannada': 'noto-serif-kannada-font',
  'Palatino': 'palatino-font',
};

function App() {
  const [content, setContent] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [font, setFont] = useState('Lato');
  const [fontSize, setFontSize] = useState(18);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timer, setTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const editorRef = useRef(null);
  const [showTimerDropdown, setShowTimerDropdown] = useState(false);
  const [showEntryPanel, setShowEntryPanel] = useState(false);
  const justLoadedEntryRef = useRef(false);
  const [randomFontName, setRandomFontName] = useState('');
  const [showChatDropdown, setShowChatDropdown] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [entryTypingSeconds, setEntryTypingSeconds] = useState(0);
  const typingTimerRef = useRef(null);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [entryColor, setEntryColor] = useState(colorOptions[0].value);

  // Dynamically set color options based on theme
  const themedColorOptions = isDarkMode
    ? [
        { name: 'White', value: '#eee' },
        { name: 'Blue', value: '#4A90E2' },
        { name: 'Red', value: '#E26A6A' },
        { name: 'Green', value: '#6AE29B' },
        { name: 'Orange', value: '#E2A84A' },
      ]
    : colorOptions;

  useEffect(() => {
    // Set random prompt on load
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    // Load entries from backend
    if (ipcRenderer) {
      ipcRenderer.invoke('load-entries').then((loaded) => {
        setEntries(loaded);
        console.log('Loaded entries:', loaded);
      });
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // When loading an entry, load its typing time from metadata
  const loadEntry = (entry) => {
    const contentOnly = entry.content.replace(/^---[\s\S]*?---\s*/, '');
    setContent(contentOnly);
    setCurrentEntry(entry.filename);
    // Extract typingSeconds from frontmatter
    const match = entry.content.match(/typingSeconds:\s*(\d+)/);
    setEntryTypingSeconds(match ? parseInt(match[1], 10) : 0);
    justLoadedEntryRef.current = true;
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerText = contentOnly;
        editorRef.current.focus();
      }
    }, 0);
  };

  // On input, update content and typing time
  const handleInput = (e) => {
    setContent(e.target.innerText);
    justLoadedEntryRef.current = false;
    setEntryTypingSeconds((s) => s + 1); // Will be incremented every second
  };

  // Track typing time (per entry)
  useEffect(() => {
    if (!content.trim()) {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      return;
    }
    if (!typingTimerRef.current) {
      typingTimerRef.current = setInterval(() => {
        setEntryTypingSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    };
  }, [content, entryColor]);

  // Autosave effect: save typing time in metadata
  useEffect(() => {
    if (!ipcRenderer) return;
    if (justLoadedEntryRef.current) return;
    if (content === '' && !currentEntry) return;
    const timeout = setTimeout(() => {
      const metadata = { font, color: entryColor, typingSeconds: entryTypingSeconds };
      ipcRenderer.invoke('save-entry', { content, metadata, filename: currentEntry }).then((res) => {
        if (res && res.filename) {
          setCurrentEntry(res.filename);
          ipcRenderer.invoke('load-entries').then(setEntries);
        }
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [content, font, entryColor, entryTypingSeconds, currentEntry]);

  const handleFontChange = (fontName) => {
    if (fontName === 'Random') {
      const fonts = randomFonts;
      const chosen = fonts[Math.floor(Math.random() * fonts.length)];
      setFont(chosen);
      setRandomFontName(chosen);
    } else {
      setFont(fontName);
      setRandomFontName('');
    }
  };

  const handleFontSizeChange = (delta) => {
    setFontSize((size) => Math.max(12, Math.min(48, size + delta)));
  };

  const playBeep = () => {
    const audio = new window.Audio(beepSound);
    audio.volume = 0.2;
    audio.play();
  };

  const startTimer = (minutes) => {
    setShowTimerDropdown(false);
    if (timer) clearInterval(timer);
    setTimeLeft(minutes * 60);
    playBeep(); // Soft beep on timer start
    const newTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(newTimer);
          playBeep(); // Soft beep on timer end
          setTimeLeft(null); // Reset timer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimer(newTimer);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleFullscreen = () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('set-fullscreen', !isFullscreen);
    }
    setIsFullscreen(!isFullscreen);
  };

  const createNewEntry = async () => {
    if (!justLoadedEntryRef.current && content.trim() !== '' && ipcRenderer) {
      const metadata = { font, color: 'Black', typingSeconds: entryTypingSeconds };
      await ipcRenderer.invoke('save-entry', { content, metadata, filename: currentEntry });
      ipcRenderer.invoke('load-entries').then(setEntries);
    }
    setContent('');
    setCurrentEntry(null);
    setEntryTypingSeconds(0);
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    if (editorRef.current) {
      editorRef.current.innerText = '';
      editorRef.current.focus();
    }
    justLoadedEntryRef.current = false;
  };

  const handleChatClick = () => {
    // Always check entryTypingSeconds for 5 min (300s)
    if (entryTypingSeconds < 300) {
      setShowChatModal(true);
      setShowChatDropdown(false);
    } else {
      setShowChatDropdown((v) => !v);
      setShowChatModal(false);
    }
  };

  const handleChatOption = (option) => {
    setShowChatDropdown(false);
    const prompt = `${CHAT_PROMPT}${content.trim()}`;
    let url = '';
    if (option === 'chatgpt') {
      url = `https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`;
    } else if (option === 'claude') {
      url = `https://claude.ai/?prompt=${encodeURIComponent(prompt)}`;
    }
    if (window.require) {
      const { shell } = window.require('electron');
      shell.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  // When switching themes, reset entry color if it would be invisible
  useEffect(() => {
    if (!isDarkMode && entryColor === '#eee') {
      setEntryColor('#222'); // Switch to black in light mode
      if (editorRef.current) editorRef.current.style.color = '#222';
    } else if (isDarkMode && entryColor === '#222') {
      setEntryColor('#eee'); // Switch to white in dark mode
      if (editorRef.current) editorRef.current.style.color = '#eee';
    }
  }, [isDarkMode]);

  const handleColorSelect = (color) => {
    setShowColorDropdown(false);
    const sel = window.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed && sel.anchorNode && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, color.value);
      // Restore caret color to entryColor after selection
      setTimeout(() => {
        const afterColor = entryColor;
        document.execCommand('foreColor', false, afterColor);
      }, 0);
    } else if (editorRef.current) {
      setEntryColor(color.value);
      editorRef.current.style.color = color.value;
    }
  };

  // Insert image at caret position
  const insertImageAtCaret = (src) => {
    if (editorRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '220px';
        img.style.maxHeight = '160px';
        img.style.display = 'inline-block';
        img.style.margin = '0 4px';
        range.insertNode(img);
        // Move caret after image
        range.setStartAfter(img);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        // Fallback: append at end
        editorRef.current.innerHTML += `<img src="${src}" style="max-width:220px;max-height:160px;display:inline-block;margin:0 4px;" />`;
      }
    }
  };

  // Handle file input
  const handleImagePick = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        insertImageAtCaret(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          insertImageAtCaret(ev.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Close the Electron app
  const handleCloseApp = () => {
    if (window.require) {
      const { remote, ipcRenderer } = window.require('electron');
      if (remote && remote.getCurrentWindow) {
        remote.getCurrentWindow().close();
      } else if (ipcRenderer) {
        ipcRenderer.send('app-quit');
      }
    }
  };

  return (
    <div className={`app minimalist ${isDarkMode ? 'dark-mode' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>      
      {/* Draggable Top Bar */}
      <div className="draggable-bar">
        <span style={{fontWeight:600, letterSpacing:'0.04em'}}>Real Journal</span>
      </div>
      {showEntryPanel && (
        <div className="entry-panel">
          <div className="entry-panel-header">
            <span>Entries</span>
            <button className="close-entry-panel" onClick={() => setShowEntryPanel(false)}>×</button>
          </div>
          <div className="entry-list">
            {[...entries].reverse().map(entry => {
              // Extract date and preview
              const match = entry.filename.match(/entry_(\d{4})-(\d{2})-(\d{2})/);
              let dateStr = entry.filename;
              if (match) {
                const d = new Date(`${match[1]}-${match[2]}-${match[3]}`);
                dateStr = d.toLocaleString('default', { month: 'short', day: 'numeric' });
              }
              // Remove frontmatter for preview and editor
              const contentOnly = entry.content.replace(/^---[\s\S]*?---\s*/, '');
              const preview = contentOnly.split('\n').find(line => line.trim()) || 'Empty entry';
              return (
                <div
                  key={entry.filename}
                  className="entry-list-item"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ flex: 1 }} onClick={async () => {
                    // Save current entry if not just loaded and changed
                    if (!justLoadedEntryRef.current && content.trim() !== '' && content !== (entries.find(e => e.filename === currentEntry)?.content.replace(/^---[\s\S]*?---\s*/, '') || '')) {
                      const metadata = { font, color: 'Black' };
                      await ipcRenderer.invoke('save-entry', { content, metadata, filename: currentEntry });
                    }
                    setShowEntryPanel(false);
                    loadEntry(entry);
                    if (ipcRenderer) {
                      ipcRenderer.invoke('load-entries').then(setEntries);
                    }
                  }}>
                    <div className="entry-list-date">{dateStr}</div>
                    <div className="entry-list-preview">{preview.slice(0, 30)}{preview.length > 30 ? '...' : ''}</div>
                  </div>
                  <button
                    className="delete-entry-btn"
                    title="Delete entry"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await ipcRenderer.invoke('delete-entry', { filename: entry.filename });
                      if (ipcRenderer) {
                        ipcRenderer.invoke('load-entries').then(setEntries);
                      }
                      // If the deleted entry is currently open, clear the editor
                      if (currentEntry === entry.filename) {
                        setContent('');
                        setCurrentEntry(null);
                        if (editorRef.current) editorRef.current.innerText = '';
                      }
                    }}
                    style={{ marginLeft: 8 }}
                  >×</button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="centered-editor-container">
        {content.trim() === '' && (
          <div className="centered-prompt">
            <span>{currentPrompt}</span>
          </div>
        )}
        <div
          ref={editorRef}
          className={`editor minimalist-editor centered-editor contenteditable-editor ${fontClassMap[font] || ''}`}
          contentEditable
          suppressContentEditableWarning
          spellCheck={true}
          style={{ fontSize: fontSize, direction: 'ltr', unicodeBidi: 'plaintext', textAlign: 'left', minHeight: '200px', maxHeight: '100%' }}
          onInput={handleInput}
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        />
      </div>
      <div className="bottom-panel minimalist-bottom-panel">
        {fontOptions.map(opt => (
          <span
            key={opt.name}
            className={font === opt.name || (opt.name === 'Random' && randomFontName) ? 'font-active' : ''}
            style={{ cursor: 'pointer', fontWeight: font === opt.name || (opt.name === 'Random' && randomFontName) ? 'bold' : 'normal' }}
            onClick={() => handleFontChange(opt.name)}
          >
            {opt.name === 'Random' && randomFontName ? `Random[${randomFontName}]` : opt.label}
            {font === opt.name && opt.name !== 'Random' ? ` [${opt.label}]` : ''}
          </span>
        ))}
        <span className="dot">•</span>
        <button className="font-size-btn" onClick={() => handleFontSizeChange(-2)}>-</button>
        <span>{fontSize}px</span>
        <button className="font-size-btn" onClick={() => handleFontSizeChange(2)}>+</button>
        <span className="dot">•</span>
        <span style={{ position: 'relative' }}>
          <button className="timer-btn" onClick={() => setShowTimerDropdown(v => !v)}>
            {timeLeft ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Timer'}
          </button>
          {showTimerDropdown && (
            <div className="timer-dropdown">
              <button onClick={() => startTimer(5)}>5:00</button>
              <button onClick={() => startTimer(10)}>10:00</button>
              <button onClick={() => startTimer(15)}>15:00</button>
            </div>
          )}
        </span>
        <span className="dot">•</span>
        <span style={{ cursor: 'pointer' }} onClick={toggleDarkMode}>{isDarkMode ? 'White Mode' : 'Dark Mode'}</span>
        <span className="dot">•</span>
        <span style={{ cursor: 'pointer', position: 'relative' }}>
          <span onClick={handleChatClick}>Chat</span>
          {showChatDropdown && (
            <div className="chat-dropdown" style={{ top: '-70px', left: 0, right: 'auto' }}>
              <button onClick={() => handleChatOption('chatgpt')}>ChatGPT</button>
              <button onClick={() => handleChatOption('claude')}>Claude</button>
            </div>
          )}
        </span>
        <span className="dot">•</span>
        {!isFullscreen && (
          <span style={{ cursor: 'pointer' }} onClick={toggleFullscreen}>Fullscreen</span>
        )}
        {isFullscreen && (
          <span style={{ cursor: 'pointer', color: '#c00', fontWeight: 600 }} onClick={toggleFullscreen}>Exit Fullscreen</span>
        )}
        <span className="dot">•</span>
        <span style={{ cursor: 'pointer' }} onClick={createNewEntry}>New Entry</span>
        <span className="dot">•</span>
        <span
          role="img"
          aria-label="clock"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowEntryPanel(true)}
        >
          🕒
        </span>
        <span className="dot">•</span>
        <span style={{ position: 'relative' }}>
          <button
            className="color-btn"
            style={{ background: entryColor, border: '1px solid #ccc', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', verticalAlign: 'middle' }}
            onClick={() => setShowColorDropdown(v => !v)}
            title="Text color"
          />
          {showColorDropdown && (
            <div className="color-dropdown">
              {themedColorOptions.map(opt => (
                <button
                  key={opt.name}
                  className="color-option-btn"
                  style={{ background: opt.value, border: entryColor === opt.value ? '2px solid #888' : '1px solid #ccc', width: 22, height: 22, borderRadius: '50%', margin: 4, cursor: 'pointer' }}
                  title={opt.name}
                  onClick={() => handleColorSelect(opt)}
                />
              ))}
            </div>
          )}
        </span>
        <span className="dot">•</span>
        <span style={{ position: 'relative' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload-input"
            onChange={handleImagePick}
          />
          <button
            className="image-btn"
            style={{ background: 'none', border: 'none', padding: 0, margin: '0 2px', cursor: 'pointer', fontSize: '1.2em', verticalAlign: 'middle' }}
            title="Insert image"
            onClick={() => document.getElementById('image-upload-input').click()}
          >
            <FaRegImage />
          </button>
        </span>
        {window.require && (
          <span className="dot">•</span>
        )}
        {window.require && (
          <button
            className="close-btn"
            title="Close"
            style={{ background: 'none', border: 'none', color: '#c00', fontSize: '1.2em', cursor: 'pointer', marginLeft: 4 }}
            onClick={handleCloseApp}
          >
            ×
          </button>
        )}
      </div>
      {/* Chat Modal */}
      {showChatModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ marginBottom: 24 }}>
              Please free write for at minimum 5 minutes first. Then click this. Trust.
            </div>
            <button onClick={() => setShowChatModal(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
