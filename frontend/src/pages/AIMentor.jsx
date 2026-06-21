import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Send, 
  Code2, 
  Binary, 
  HelpCircle, 
  MessageSquare,
  Bot, 
  User,
  Loader2,
  CheckCircle,
  Copy,
  AlertCircle,
  HelpCircle as HintIcon,
  SearchCode
} from 'lucide-react';

// Custom lightweight Regex-based Markdown renderer
const MarkdownRenderer = ({ content = '' }) => {
  const parts = content.split(/(\`\`\`[a-z]*[\s\S]*?\`\`\`)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-foreground font-medium">
      {parts.map((part, index) => {
        // Code Block
        if (part.startsWith('```')) {
          const match = part.match(/\`\`\`([a-z]*)\n([\s\S]*?)\`\`\`/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div key={index} className="bg-slate-950 text-slate-100 rounded-xl overflow-hidden my-2 border border-border/80">
              {lang && (
                <div className="px-4 py-1.5 bg-slate-900 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase font-mono">
                  {lang}
                </div>
              )}
              <pre className="p-4 overflow-x-auto font-mono text-xs leading-normal">{code}</pre>
            </div>
          );
        }

        // Standard Text: Parse simple bold, bullet points, headers
        let htmlText = part
          .replace(/###\s+(.*)/g, '<h5 class="text-base font-bold text-foreground mt-3 mb-1.5">$1</h5>')
          .replace(/##\s+(.*)/g, '<h4 class="text-lg font-extrabold text-foreground mt-4 mb-2">$1</h4>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-foreground">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
          .replace(/\`(.*?)\`/g, '<code class="bg-muted px-1.5 py-0.5 rounded font-mono text-primary text-xs font-semibold">$1</code>')
          .replace(/^\s*[-*]\s+(.*)/gm, '<li class="ml-4 list-disc">$1</li>');

        // Split paragraphs
        const paragraphs = htmlText.split('\n');

        return (
          <div key={index} className="space-y-1">
            {paragraphs.map((p, i) => {
              if (p.trim().startsWith('<li') || p.trim().startsWith('<h')) {
                return <div key={i} dangerouslySetInnerHTML={{ __html: p }} />;
              }
              return p.trim() ? <p key={i} dangerouslySetInnerHTML={{ __html: p }} /> : null;
            })}
          </div>
        );
      })}
    </div>
  );
};

// Parse markdown to extract Java and C code blocks
const parseHintContent = (content) => {
  if (!content) return null;
  // Try to find a Java code block (```java ... ```)
  const javaMatch = content.match(/\`\`\`java\n([\s\S]*?)\`\`\`/);
  // Try to find a C code block (```c\n ... ``` or ```c ... ```)
  const cMatch = content.match(/\`\`\`c\n([\s\S]*?)\`\`\?/);

  if (javaMatch || cMatch) {
    // Extract description (everything before the first code block)
    const firstCodeIdx = content.indexOf('```');
    const description = firstCodeIdx !== -1 ? content.slice(0, firstCodeIdx).trim() : content;
    
    // Extract remaining text (after the last code block)
    const lastCodeIdx = content.lastIndexOf('```');
    const footer = lastCodeIdx !== -1 ? content.slice(lastCodeIdx + 3).trim() : '';

    return {
      description,
      javaCode: javaMatch ? javaMatch[1].trim() : null,
      cCode: cMatch ? cMatch[1].trim() : null,
      footer: footer.startsWith('c\n') ? footer.slice(2).trim() : footer
    };
  }
  return null;
};

// Render parsed hint with language switcher tabs
const ParsedHintRenderer = ({ content, activeTab, setActiveTab }) => {
  const [copied, setCopied] = useState(false);
  const parsed = parseHintContent(content);
  
  if (!parsed) {
    return <MarkdownRenderer content={content} />;
  }

  const handleCopy = () => {
    const codeToCopy = activeTab === 'java' ? parsed.javaCode : parsed.cCode;
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {parsed.description && <MarkdownRenderer content={parsed.description} />}
      
      {/* Code tab switcher */}
      <div className="flex gap-2 border-b border-border/30 pb-2">
        {parsed.javaCode && (
          <button 
            type="button" 
            onClick={() => setActiveTab('java')}
            className={`px-3 py-1.5 text-sm font-bold rounded-lg cursor-pointer transition-all uppercase tracking-wider ${
              activeTab === 'java'
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Java Template
          </button>
        )}
        {parsed.cCode && (
          <button 
            type="button" 
            onClick={() => setActiveTab('c')}
            className={`px-3 py-1.5 text-sm font-bold rounded-lg cursor-pointer transition-all uppercase tracking-wider ${
              activeTab === 'c'
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            C Template
          </button>
        )}
      </div>

      {/* Code Render */}
      <div className="bg-slate-950 text-slate-100 rounded-xl overflow-hidden border border-border/40 my-2 relative">
        <div className="px-4 py-1.5 bg-slate-900 border-b border-border/30 text-xs font-bold text-muted-foreground uppercase font-mono flex items-center justify-between">
          <span>{activeTab === 'java' ? 'java' : 'c'}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="hover:text-foreground transition-all cursor-pointer flex items-center gap-1.5 uppercase font-bold text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
        <pre className="p-4 overflow-x-auto font-mono text-xs leading-normal">
          {activeTab === 'java' ? parsed.javaCode : parsed.cCode}
        </pre>
      </div>

      {parsed.footer && <MarkdownRenderer content={parsed.footer} />}
    </div>
  );
};

const AIMentor = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'reviewer', 'detector', 'hints'
  const chatEndRef = useRef(null);

  // --- Chat Tab State ---
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am your AI Mentor. Let's learn DSA today! Ask me about patterns, problem concepts, or complexity optimizations." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // --- Code Reviewer State ---
  const [codeReviewText, setCodeReviewText] = useState('');
  const [codeLang, setCodeLang] = useState('javascript');
  const [reviewerLoading, setReviewerLoading] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);

  // --- Pattern Detector State ---
  const [problemStatement, setProblemStatement] = useState('');
  const [detectorLoading, setDetectorLoading] = useState(false);
  const [detectedPattern, setDetectedPattern] = useState(null);

  // --- Hint System State ---
  const [problemTitle, setProblemTitle] = useState('');
  const [hintNumber, setHintNumber] = useState(1);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintResult, setHintResult] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState('java');

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Handle Chat Submit
  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Please verify API key configs.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Code Review Submit
  const handleCodeReview = async (e) => {
    e.preventDefault();
    if (!codeReviewText.trim()) return;

    setReviewerLoading(true);
    setReviewResult(null);
    try {
      const res = await api.post('/ai/review-code', {
        code: codeReviewText,
        language: codeLang
      });
      setReviewResult(res.data);
    } catch (error) {
      console.error('Review code error:', error);
    } finally {
      setReviewerLoading(false);
    }
  };

  // Handle Pattern Detect Submit
  const handlePatternDetect = async (e) => {
    e.preventDefault();
    if (!problemStatement.trim()) return;

    setDetectorLoading(true);
    setDetectedPattern(null);
    try {
      const res = await api.post('/ai/detect-pattern', {
        statement: problemStatement
      });
      setDetectedPattern(res.data);
    } catch (error) {
      console.error('Detect pattern error:', error);
    } finally {
      setDetectorLoading(false);
    }
  };

  // Helper to fetch hint
  const fetchHint = async (title, level) => {
    if (!title.trim()) return;
    setHintLoading(true);
    setHintResult('');
    try {
      const res = await api.post('/ai/hint', {
        problemTitle: title,
        hintNumber: Number(level)
      });
      setHintResult(res.data.hint);
    } catch (error) {
      console.error('Hint error:', error);
    } finally {
      setHintLoading(false);
    }
  };

  // Handle Hint Request
  const handleHintRequest = (e) => {
    e.preventDefault();
    fetchHint(problemTitle, hintNumber);
  };

  // Handle level button click
  const handleHintLevelChange = (level) => {
    setHintNumber(level);
    if (problemTitle.trim()) {
      fetchHint(problemTitle, level);
    } else {
      setHintResult('');
    }
  };

  return (
    <div className="p-6 w-full space-y-6 bg-grid-pattern relative overflow-hidden min-h-screen lg:h-screen lg:flex lg:flex-col lg:overflow-hidden">
      
      {/* Background glow blobs */}
      <div className="glow-blob top-10 right-10 w-80 h-80 bg-primary/10"></div>
      <div className="glow-blob bottom-10 left-10 w-80 h-80 bg-accent/10"></div>

      {/* Header Banner */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl flex items-center justify-between shadow-sm relative z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-primary to-accent text-white rounded-xl shadow-glow-primary">
            <Sparkles className="h-5 w-5 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">AI Mentor Workspace</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">Ask questions, audit code complexity, detect patterns, or request hints.</p>
          </div>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-1 min-h-0 pb-2">
        
        {/* Navigation Tabs List (3 cols on desktop) */}
        <div className="lg:col-span-3 space-y-1.5 h-fit lg:h-full glass-panel border border-border/40 p-3.5 rounded-3xl shadow-sm flex flex-col overflow-y-auto">
          {[
            { id: 'chat', label: 'Mentor Chat', icon: MessageSquare },
            { id: 'reviewer', label: 'Code Reviewer', icon: Code2 },
            { id: 'detector', label: 'Pattern Detector', icon: SearchCode },
            { id: 'hints', label: 'Hint Dispenser', icon: HintIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl font-bold text-sm transition-all uppercase tracking-wider text-left cursor-pointer border border-transparent ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-glow-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border/30'
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Workspace Display Container (9 cols on desktop) */}
        <div className="lg:col-span-9 glass-panel border border-border/40 rounded-3xl shadow-sm flex flex-col overflow-hidden relative z-10 min-h-[500px] lg:h-full">
          
          {/* TAB 1: Chat interface */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
              {/* Message Streams */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm uppercase shadow-sm ${
                      msg.role === 'user' ? 'bg-gradient-to-br from-accent to-pink-500' : 'bg-gradient-to-br from-primary to-indigo-600'
                    }`}>
                      {msg.role === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-primary to-indigo-600 text-white rounded-tr-none shadow-glow-primary' 
                        : 'bg-card/45 text-foreground border border-border/30 rounded-tl-none shadow-sm'
                    }`}>
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                    <div className="p-4 rounded-2xl bg-card/45 border border-border/30 rounded-tl-none flex items-center gap-2 text-sm text-muted-foreground font-bold uppercase tracking-wider">
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                      <span>Mentor is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleChatSend} className="p-4 border-t border-border/30 bg-muted/15 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about Two Pointers, BFS, or DP memoization..."
                  className="flex-1 glass-input focus:ring-1 focus:ring-primary/20"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="px-5 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:opacity-95 shadow-glow-primary transition-all flex items-center justify-center cursor-pointer"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Code Reviewer */}
          {activeTab === 'reviewer' && (
            <div className="p-5 space-y-5 overflow-y-auto h-full scrollbar">
              <div>
                <h3 className="font-extrabold text-base text-foreground">AI Code Reviewer</h3>
                <p className="text-sm text-muted-foreground mt-0.5 font-medium">Submit your code to inspect space/time complexity and identify hidden edge cases.</p>
              </div>

              <form onSubmit={handleCodeReview} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="col-span-1 px-3 py-2 bg-muted/40 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-primary text-foreground font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <option value="javascript" className="bg-[#0d1324] text-foreground">JavaScript</option>
                    <option value="python" className="bg-[#0d1324] text-foreground">Python</option>
                    <option value="cpp" className="bg-[#0d1324] text-foreground">C++</option>
                    <option value="java" className="bg-[#0d1324] text-foreground">Java</option>
                  </select>
                </div>

                <textarea
                  value={codeReviewText}
                  onChange={(e) => setCodeReviewText(e.target.value)}
                  placeholder="Paste your solution code here..."
                  className="w-full h-44 p-4 bg-slate-950 text-slate-100 text-sm font-mono rounded-xl focus:outline-none border border-border/40 resize-none shadow-inner"
                  required
                />

                <button
                  type="submit"
                  disabled={reviewerLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-glow-primary hover:opacity-95"
                >
                  {reviewerLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Code2 className="h-4.5 w-4.5" />}
                  <span>Analyze Complexity</span>
                </button>
              </form>

              {/* Review Result Display */}
              {reviewResult && (
                <div className="border border-border/40 rounded-2xl p-5 bg-card/25 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/15 border border-border/30 p-4 rounded-xl text-center shadow-inner relative overflow-hidden">
                      <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">TIME COMPLEXITY</span>
                      <strong className="text-lg text-primary font-mono font-extrabold mt-1 block">{reviewResult.timeComplexity}</strong>
                    </div>
                    <div className="bg-muted/15 border border-border/30 p-4 rounded-xl text-center shadow-inner relative overflow-hidden">
                      <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">SPACE COMPLEXITY</span>
                      <strong className="text-lg text-primary font-mono font-extrabold mt-1 block">{reviewResult.spaceComplexity}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Suggestions</h5>
                      <ul className="text-sm text-muted-foreground space-y-1.5 font-medium leading-relaxed">
                        {reviewResult.suggestions.map((sug, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Edge Cases</h5>
                      <ul className="text-sm text-muted-foreground space-y-1.5 font-medium leading-relaxed">
                        {reviewResult.edgeCases.map((edge, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-accent mt-0.5">•</span>
                            <span>{edge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <span className="text-xs text-primary font-extrabold block uppercase tracking-widest">Interview Feedback</span>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed font-semibold">{reviewResult.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Pattern Detector */}
          {activeTab === 'detector' && (
            <div className="p-5 space-y-5 overflow-y-auto h-full scrollbar">
              <div>
                <h3 className="font-extrabold text-base text-foreground">AI Pattern Detector</h3>
                <p className="text-sm text-muted-foreground mt-0.5 font-medium">Paste a problem description and learn which design template fits it best.</p>
              </div>

              <form onSubmit={handlePatternDetect} className="space-y-4">
                <textarea
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Paste LeetCode, CodeChef, or custom problem description here..."
                  className="w-full h-44 p-4 glass-input focus:ring-1 focus:ring-primary/25 resize-none leading-relaxed font-medium text-sm"
                  required
                />

                <button
                  type="submit"
                  disabled={detectorLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-glow-primary hover:opacity-95"
                >
                  {detectorLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <SearchCode className="h-4.5 w-4.5" />}
                  <span>Detect Pattern</span>
                </button>
              </form>

              {/* Scanning visual state */}
              {detectorLoading && (
                <div className="relative h-20 w-full bg-slate-900/60 border border-border/30 rounded-xl overflow-hidden flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary shadow-glow-primary animate-scan z-10" />
                  <span className="text-xs font-mono font-bold text-primary tracking-widest animate-pulse">CLASSIFYING PROBLEM STATEMENT...</span>
                </div>
              )}

              {/* Detected Pattern Result */}
              {detectedPattern && !detectorLoading && (
                <div className="border border-border/40 rounded-2xl p-5 bg-card/25 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border/30 pb-3">
                    <div>
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">CLASSIFICATION</span>
                      <h4 className="text-xl font-extrabold text-foreground mt-0.5">{detectedPattern.pattern}</h4>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-sm bg-primary/10 text-primary border border-primary/20 font-bold px-2.5 py-1 rounded-lg">
                        Confidence {Math.round(detectedPattern.confidence * 100)}%
                      </span>
                      <span className="text-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold px-2.5 py-1 rounded-lg">
                        {detectedPattern.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-primary font-extrabold block uppercase tracking-widest">Suggested Approach</span>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed font-semibold">{detectedPattern.suggestedApproach}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-bold">
                    <span className="text-muted-foreground">Est. Time Complexity: <strong className="text-foreground font-mono">{detectedPattern.timeComplexity || 'O(N)'}</strong></span>
                    <span className="text-muted-foreground">Est. Space Complexity: <strong className="text-foreground font-mono">{detectedPattern.spaceComplexity || 'O(N)'}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Hint System */}
          {activeTab === 'hints' && (
            <div className="p-5 space-y-6 overflow-y-auto h-full scrollbar">
              <div>
                <h3 className="font-extrabold text-base text-foreground">Incremental Hint Dispenser</h3>
                <p className="text-sm text-muted-foreground mt-0.5 font-medium">Request small hints without spoiling the entire solution immediately.</p>
              </div>

              <form onSubmit={handleHintRequest} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Problem Title</label>
                  <input
                    type="text"
                    value={problemTitle}
                    onChange={(e) => {
                      setProblemTitle(e.target.value);
                      if (hintResult) setHintResult('');
                    }}
                    placeholder="e.g., Two Sum, 3Sum, Valid Parentheses"
                    className="w-full glass-input focus:ring-1 focus:ring-primary/25 font-semibold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">Unlock Progression</label>
                  <div className="relative flex items-center justify-between mt-2 mb-6">
                    {/* Connecting line */}
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-muted rounded-full z-0 border border-border/20">
                      <div 
                        className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300 z-0"
                        style={{ width: `${((hintNumber - 1) / 3) * 100}%` }}
                      />
                    </div>
                    
                    {/* Nodes */}
                    {[
                      { num: 1, label: 'Conceptual', desc: 'Hint 1' },
                      { num: 2, label: 'Strategy', desc: 'Hint 2' },
                      { num: 3, label: 'Template', desc: 'Hint 3' },
                      { num: 4, label: 'Full Code', desc: 'Level 4' },
                    ].map((h) => {
                      const isActive = hintNumber === h.num;
                      const isCompleted = hintNumber > h.num;
                      return (
                        <button
                          key={h.num}
                          type="button"
                          onClick={() => handleHintLevelChange(h.num)}
                          className="relative flex flex-col items-center z-10 focus:outline-none cursor-pointer"
                        >
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                            isActive 
                              ? 'bg-gradient-to-r from-primary to-accent text-white border-primary shadow-glow-primary scale-110'
                              : isCompleted
                                ? 'bg-primary/20 text-primary border-primary/45'
                                : 'bg-card border-border/80 text-muted-foreground'
                          }`}>
                            {isCompleted ? '✓' : h.num}
                          </div>
                          <span className={`text-xs font-extrabold uppercase mt-2 hidden sm:block ${
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {h.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={hintLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-glow-primary hover:opacity-95"
                >
                  {hintLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <HintIcon className="h-4.5 w-4.5" />}
                  <span>Dispense Hint</span>
                </button>
              </form>

              {/* Hint Result */}
              {hintResult && (
                <div className="border border-border/40 rounded-2xl p-5 bg-card/25 shadow-sm">
                  <span className="text-xs text-primary font-extrabold block uppercase tracking-widest mb-3">
                    {hintNumber === 4 ? 'Optimal Full Solution' : `Hint #${hintNumber}`}
                  </span>
                  <ParsedHintRenderer 
                    content={hintResult} 
                    activeTab={activeCodeTab} 
                    setActiveTab={setActiveCodeTab} 
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AIMentor;
