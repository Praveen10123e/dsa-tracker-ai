import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PATTERNS_DATA } from '../data/patternsData';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  BookOpen, 
  Sparkles, 
  Clock, 
  BrainCircuit, 
  CheckCircle2, 
  Circle, 
  ExternalLink,
  Code2,
  X,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';

const PatternDetail = () => {
  const { patternName } = useParams();
  const { refreshUser } = useAuth();
  const decodedPattern = decodeURIComponent(patternName);
  const pattern = PATTERNS_DATA[decodedPattern];

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleGenerateAIProblems = async () => {
    try {
      setGeneratingAI(true);
      const res = await api.post('/problems/generate-ai', { pattern: decodedPattern });
      alert(res.data.message || 'Problems generated successfully!');
      await fetchProblems();
    } catch (err) {
      console.error('Error generating AI problems:', err);
      alert(err.response?.data?.message || 'Failed to generate problems with AI');
    } finally {
      setGeneratingAI(false);
    }
  };
  
  // Code Submission Modal State
  const [selectedProblem, setSelectedProblem] = useState(null); // problem object
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solveResult, setSolveResult] = useState(null); // { xpEarned, leveledUp, badges }

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/problems?pattern=${encodeURIComponent(decodedPattern)}`);
      setProblems(res.data);
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pattern) {
      fetchProblems();
    }
  }, [decodedPattern]);

  if (!pattern) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
        <h2 className="text-lg font-bold text-foreground">Pattern not found</h2>
        <Link to="/patterns" className="text-primary hover:underline mt-2 inline-block font-bold">
          Back to Patterns Library
        </Link>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pattern.template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProblem) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/progress/solve', {
        problemId: selectedProblem._id,
        codeSubmitted: code,
        notes: notes
      });
      
      setSolveResult(res.data);
      await fetchProblems(); // refresh problem list solved state
      await refreshUser(); // refresh user levels/streaks
    } catch (error) {
      console.error('Error submitting solve progress:', error);
      alert('Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedProblem(null);
    setCode('');
    setNotes('');
    setSolveResult(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-grid-pattern relative overflow-hidden min-h-screen">
      
      {/* Background glow blobs */}
      <div className="glow-blob top-10 right-10 w-80 h-80 bg-primary/10"></div>
      <div className="glow-blob bottom-10 left-10 w-80 h-80 bg-accent/10"></div>

      {/* Back link */}
      <Link to="/patterns" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary font-bold uppercase tracking-wider transition-all relative z-10">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Patterns</span>
      </Link>

      {/* Pattern Header */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl relative overflow-hidden z-10 shadow-sm">
        <div className="absolute right-10 top-0 w-36 h-36 bg-accent/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{decodedPattern} Pattern</h1>
            <span className={`inline-block text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border mt-2 ${
              pattern.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              pattern.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              {pattern.difficulty} Level
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed font-semibold">
          {pattern.description}
        </p>
      </div>

      {/* Concept Grid (Clues, Tips, Complexities) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
        
        {/* Clues */}
        <div className="glass-card border border-border/40 p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-4.5 w-4.5" />
            <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Recognition Clues</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pattern.clues.map((clue, idx) => (
              <span key={idx} className="bg-muted/60 text-muted-foreground text-xs font-bold px-2 py-1 rounded-md border border-border/20 uppercase tracking-wide">
                {clue}
              </span>
            ))}
          </div>
        </div>

        {/* Complexities */}
        <div className="glass-card border border-border/40 p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-4.5 w-4.5" />
            <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Standard Complexities</h4>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 font-semibold pt-1">
            <li>Time Complexity: <strong className="text-foreground font-mono">{pattern.complexityTime}</strong></li>
            <li>Space Complexity: <strong className="text-foreground font-mono">{pattern.complexitySpace}</strong></li>
          </ul>
        </div>

        {/* Tips */}
        <div className="glass-card border border-border/40 p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4.5 w-4.5" />
            <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Interview Tips</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold pt-0.5">
            {pattern.tips}
          </p>
        </div>

      </div>

      {/* Template Code Snippet */}
      <div className="glass-panel border border-border/40 rounded-3xl overflow-hidden shadow-sm relative z-10">
        <div className="flex justify-between items-center px-5 py-3 border-b border-border/30 bg-muted/15">
          <div className="flex items-center gap-2 text-foreground">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Standard JavaScript Template</span>
          </div>
          <button 
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-border/50 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
            title="Copy Code Template"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <pre className="p-5 overflow-x-auto text-xs font-mono bg-slate-950 text-slate-100 leading-normal border-0 rounded-b-2xl">
          <code>{pattern.template}</code>
        </pre>
      </div>

      {/* Practice Roadmap Grid */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl shadow-sm space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Pattern Practice Roadmap</h4>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">Solve these standard questions in sequence to build muscle memory.</p>
          </div>
          <button
            onClick={handleGenerateAIProblems}
            disabled={generatingAI}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-glow-primary transition-all duration-200 cursor-pointer"
          >
            <Sparkles className={`h-3.5 w-3.5 ${generatingAI ? 'animate-spin' : ''}`} />
            <span>{generatingAI ? 'Generating...' : 'Generate AI Problems'}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto mb-2" />
            <span>Loading roadmap problems...</span>
          </div>
        ) : problems.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/30 border-b border-border/30 text-muted-foreground font-bold uppercase tracking-wider text-xs">
                  <th className="p-3.5 pl-5">Status</th>
                  <th className="p-3.5">Problem Title</th>
                  <th className="p-3.5">Difficulty</th>
                  <th className="p-3.5 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {problems.map((prob) => (
                  <tr key={prob._id} className="hover:bg-muted/15 transition-colors">
                    <td className="p-3.5 pl-5">
                      {prob.isSolved ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 fill-emerald-500/10" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-muted-foreground/45" />
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-foreground">{prob.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-bold uppercase tracking-wide">{prob.platform} • Est. {prob.estimatedSolveTime} mins</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="inline-flex gap-2">
                        {/* Solve external link */}
                        <a 
                          href={prob.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 border border-border/40 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer shadow-sm"
                          title="Open LeetCode Page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        
                        {/* Solve trigger modal */}
                        <button
                          onClick={() => setSelectedProblem(prob)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-lg hover:opacity-95 shadow-glow-primary transition-all cursor-pointer uppercase tracking-wider"
                        >
                          {prob.isSolved ? 'Resubmit' : 'Solve'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
            <span>No problems pre-seeded for this pattern. Click Generate to add AI tasks.</span>
          </div>
        )}
      </div>

      {/* Code Submission Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-border/40 w-full max-w-2xl rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/45 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Content */}
            {!solveResult ? (
              <form onSubmit={handleSolveSubmit} className="space-y-4 flex-1 flex flex-col overflow-y-auto">
                <div>
                  <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Submit Code</span>
                  <h3 className="text-base font-extrabold text-foreground mt-0.5">{selectedProblem.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">Provide your code and notes to earn XP and level up!</p>
                </div>

                {/* Code area */}
                <div className="flex-1 flex flex-col min-h-[220px]">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Paste Solution Code</label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="function solve() { ... }"
                    className="w-full flex-1 p-4 bg-slate-950 text-slate-100 text-xs font-mono rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/20 border border-border/30 resize-none shadow-inner"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Learning Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Space optimized version using sliding pointers."
                    className="w-full p-3 glass-input focus:ring-1 focus:ring-primary/20 resize-none h-20 leading-normal"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex justify-center items-center shadow-glow-primary hover:opacity-95"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Solution'}
                </button>
              </form>
            ) : (
              // Success Screen!
              <div className="text-center py-8 space-y-6 flex-1 flex flex-col justify-center items-center">
                <div className="inline-flex bg-gradient-to-tr from-emerald-500 to-teal-500 p-4 rounded-full text-white shadow-glow-primary animate-bounce-slow">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                
                <div>
                  <h3 className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    Problem Mastered!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Your progress was logged successfully.</p>
                </div>

                {/* Gamified Rewards */}
                <div className="flex gap-4 max-w-sm w-full pt-2">
                  {/* XP Reward card */}
                  <div className="flex-1 bg-muted/20 border border-border/30 p-4 rounded-xl text-center shadow-inner">
                    <TrendingUp className="h-4.5 w-4.5 text-emerald-500 mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground block font-bold uppercase tracking-wider">XP Earned</span>
                    <strong className="text-base text-foreground font-extrabold">+{solveResult.xpEarned} XP</strong>
                  </div>

                  {/* Level up check */}
                  {solveResult.leveledUp && (
                    <div className="flex-1 bg-gradient-to-tr from-primary/10 to-accent/10 border border-primary/20 p-4 rounded-xl text-center shadow-inner">
                      <Sparkles className="h-4.5 w-4.5 text-primary mx-auto mb-1 animate-pulse-slow" />
                      <span className="text-xs text-primary font-bold block uppercase tracking-wider">LEVEL UP!</span>
                      <strong className="text-base text-foreground font-extrabold">Level {solveResult.user?.level}</strong>
                    </div>
                  )}
                </div>

                {/* Badges Earned */}
                {solveResult.newBadgesEarned?.length > 0 && (
                  <div className="p-4 bg-muted/20 border border-border/30 rounded-xl max-w-sm w-full text-left shadow-inner">
                    <span className="text-xs font-bold text-accent uppercase tracking-widest block">Badges Unlocked:</span>
                    <ul className="text-xs text-foreground font-bold mt-1.5 list-disc list-inside space-y-1">
                      {solveResult.newBadgesEarned.map((badge, i) => (
                        <li key={i}>{badge}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-xl hover:opacity-95 transition-all cursor-pointer shadow-glow-primary uppercase tracking-wider"
                >
                  Awesome
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternDetail;
