import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  MessageSquareCode,
  X,
  ExternalLink,
  Circle,
  TrendingUp
} from 'lucide-react';

const COMPANIES = [
  { id: 'google', name: 'Google', color: 'border-red-500/20 text-red-500 bg-red-500/5', patterns: ['Trees', 'Graphs', 'Binary Search', 'Sliding Window', 'Dynamic Programming'] },
  { id: 'meta', name: 'Meta', color: 'border-blue-500/20 text-blue-500 bg-blue-500/5', patterns: ['Arrays', 'Two Pointers', 'Sliding Window', 'Linked List', 'Backtracking'] },
  { id: 'amazon', name: 'Amazon', color: 'border-orange-500/20 text-orange-500 bg-orange-500/5', patterns: ['Hashing', 'Heap / Priority Queue', 'Greedy', 'Trees', 'Graphs'] },
  { id: 'microsoft', name: 'Microsoft', color: 'border-teal-500/20 text-teal-500 bg-teal-500/5', patterns: ['Strings', 'Stack', 'Trees', 'Binary Search Trees', 'Dynamic Programming'] },
  { id: 'adobe', name: 'Adobe', color: 'border-purple-500/20 text-purple-500 bg-purple-500/5', patterns: ['Arrays', 'Strings', 'Linked List', 'Greedy', 'Bit Manipulation'] },
  { id: 'walmart', name: 'Walmart', color: 'border-sky-500/20 text-sky-500 bg-sky-500/5', patterns: ['Arrays', 'Prefix Sum', 'Stack', 'Dynamic Programming', 'Greedy'] }
];

const InterviewPrep = () => {
  const { user, updateUserSettings, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Code Submission Modal State
  const [selectedProblem, setSelectedProblem] = useState(null); // problem object
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solveResult, setSolveResult] = useState(null); // { xpEarned, leveledUp, badges }

  useEffect(() => {
    if (user && user.selectedCompanies) {
      setSelectedCompanies(user.selectedCompanies);
      fetchCompanyProblems(user.selectedCompanies);
    }
  }, [user]);

  const fetchCompanyProblems = async (companiesList) => {
    if (companiesList.length === 0) {
      setProblems([]);
      return;
    }
    setLoading(true);
    try {
      // Fetch all problems and filter client side by matching company tags
      const res = await api.get('/problems');
      const filtered = res.data.filter(prob => 
        prob.tags.some(t => companiesList.map(c => c.toLowerCase()).includes(t))
      );
      setProblems(filtered);
    } catch (error) {
      console.error('Error fetching company problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyToggle = async (companyName) => {
    let updated;
    if (selectedCompanies.includes(companyName)) {
      updated = selectedCompanies.filter(c => c !== companyName);
    } else {
      updated = [...selectedCompanies, companyName];
    }
    setSelectedCompanies(updated);
    
    // Save to user settings in DB
    await updateUserSettings(user.targetProblemsPerDay, updated);
    fetchCompanyProblems(updated);
  };

  const handleStartMock = (companyName) => {
    // Navigate to AI Mentor with a state that triggers a mock interview prompt
    navigate('/ai-mentor', { 
      state: { 
        triggerPrompt: `Hello! I would like to conduct a mock interview for ${companyName}. Please act as a technical interviewer and ask me one coding question. Start by asking me to introduce myself.` 
      } 
    });
  };

  const handleGenerateAI = async () => {
    if (selectedCompanies.length === 0) return;
    setGeneratingAI(true);
    try {
      for (const company of selectedCompanies) {
        await api.post('/problems/generate-company-ai', { company });
      }
      alert('AI Problems generated/checked successfully for selected companies!');
      await fetchCompanyProblems(selectedCompanies);
    } catch (error) {
      console.error('Error generating AI problems:', error);
      alert(error.response?.data?.message || 'Failed to generate AI problems.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setGeneratingAI(true);
    try {
      // Call backend to generate/search company problems
      const res = await api.post('/problems/generate-company-ai', { company: query });
      
      // Add query to selectedCompanies if not present
      let updated = [...selectedCompanies];
      const existingCompany = updated.find(c => c.toLowerCase() === query.toLowerCase());
      
      // Normalize casing
      const displayName = existingCompany || (query.charAt(0).toUpperCase() + query.slice(1));
      
      if (!existingCompany) {
        updated.push(displayName);
        setSelectedCompanies(updated);
        await updateUserSettings(user.targetProblemsPerDay, updated);
      }
      
      alert(res.data.message || `Problems generated for ${displayName}`);
      setSearchQuery('');
      await fetchCompanyProblems(updated);
    } catch (error) {
      console.error('Search and generate error:', error);
      alert(error.response?.data?.message || 'Failed to search and generate problems for this company.');
    } finally {
      setGeneratingAI(false);
    }
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
      await fetchCompanyProblems(selectedCompanies); // refresh problem list solved state
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

  // Build combined list of target companies (standard + user added custom companies)
  const allDisplayCompanies = [...COMPANIES];
  selectedCompanies.forEach(name => {
    if (!COMPANIES.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      allDisplayCompanies.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        color: 'border-amber-500/20 text-amber-500 bg-amber-500/5',
        isCustom: true
      });
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-grid-pattern relative overflow-hidden min-h-screen">
      
      {/* Background glow blobs */}
      <div className="glow-blob top-10 right-10 w-96 h-96 bg-primary/10"></div>
      <div className="glow-blob bottom-10 left-10 w-96 h-96 bg-accent/10"></div>

      {/* Header Banner */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 shadow-sm">
        <div className="absolute right-10 top-0 w-36 h-36 bg-accent/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-primary to-accent text-white rounded-xl shadow-glow-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Interview Preparation Module</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
              Select your target companies to audit customized templates and practice roadmaps.
            </p>
          </div>
        </div>

        {/* Search & Add Custom Company Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto relative z-20">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search & Add Company (e.g. Netflix)"
            className="px-4 py-2 text-xs rounded-xl glass-input w-full md:w-60 focus:outline-none focus:ring-1 focus:ring-primary/20 border border-border/30 bg-card/30 text-foreground"
          />
          <button
            type="submit"
            disabled={generatingAI}
            className="px-4 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-glow-primary transition-all duration-200 flex items-center gap-1 uppercase tracking-wider cursor-pointer whitespace-nowrap"
          >
            {generatingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>{generatingAI ? 'Searching...' : 'Search'}</span>
          </button>
        </form>
      </div>

      {/* Company Selection Cards */}
      <div className="space-y-4 relative z-10">
        <h3 className="font-extrabold text-xs text-foreground uppercase tracking-wider">Select Target Companies</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {allDisplayCompanies.map((company) => {
            const isSelected = selectedCompanies.includes(company.name);
            return (
              <button
                key={company.id}
                onClick={() => handleCompanyToggle(company.name)}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl text-center transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? `border-primary bg-primary/5 text-primary scale-[1.02] shadow-glow-primary glass-card` 
                    : 'border-border/45 bg-card/30 text-muted-foreground hover:text-foreground hover:border-primary/20 glass-card'
                }`}
              >
                <div className={`p-3 rounded-xl mb-3 border transition-colors duration-300 ${company.color} ${
                  isSelected ? 'border-primary/30' : ''
                }`}>
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-xs font-extrabold tracking-wide">{company.name}</span>
                {isSelected && (
                  <span className="text-xs bg-primary/15 text-primary font-black px-2 py-0.5 rounded-full mt-2.5 uppercase tracking-wider border border-primary/20">
                    {company.isCustom ? 'CUSTOM' : 'TARGET'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Companies Details & Mock Triggers */}
      {selectedCompanies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Practice List (2 cols) */}
          <div className="md:col-span-2 glass-panel border border-border/40 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Company Targeted Problem Roadmap</h4>
                <p className="text-sm text-muted-foreground mt-1 font-medium">Most common questions asked at your selected companies</p>
              </div>
              <button
                onClick={handleGenerateAI}
                disabled={generatingAI}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-glow-primary transition-all duration-200 cursor-pointer uppercase tracking-wider"
              >
                <Sparkles className={`h-3.5 w-3.5 ${generatingAI ? 'animate-spin' : ''}`} />
                <span>{generatingAI ? 'Generating...' : 'Generate AI Problems'}</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Scanning company problem archives...</span>
              </div>
            ) : problems.length > 0 ? (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {problems.map((prob) => (
                  <div 
                    key={prob._id} 
                    className="flex items-center justify-between p-4.5 glass-card border border-border/40 rounded-2xl hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{prob.platform}</span>
                      </div>
                      <h5 className="font-extrabold text-sm text-foreground mt-2 truncate tracking-wide leading-snug">{prob.title}</h5>
                      <span className="text-xs text-muted-foreground font-semibold mt-1 block">Pattern: <strong className="text-foreground">{prob.pattern}</strong></span>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {prob.isSolved && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                      )}
                      <a 
                        href={prob.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 border border-border/40 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all cursor-pointer shadow-sm shrink-0"
                        title="Open Problem Page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => setSelectedProblem(prob)}
                        className="px-3.5 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-xl hover:opacity-95 shadow-glow-primary transition-all cursor-pointer uppercase tracking-wider shrink-0"
                      >
                        {prob.isSolved ? 'Resubmit' : 'Solve'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
                No problems matched the selected company tags. Add custom companies or click Generate to create AI tasks.
              </div>
            )}
          </div>

          {/* AI Mock Interviews Trigger Panel (1 col) */}
          <div className="glass-panel border border-border/40 p-6 rounded-3xl shadow-sm h-fit space-y-4">
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">AI Mock Interviews</h4>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Trigger a company specific interview simulation with the AI mentor.</p>
            </div>

            <div className="space-y-3 pt-2">
              {selectedCompanies.map((name) => (
                <button
                  key={name}
                  onClick={() => handleStartMock(name)}
                  className="w-full flex items-center justify-between p-4 bg-muted/20 border border-border/30 hover:border-primary/30 hover:bg-muted/30 rounded-2xl transition-all duration-300 text-left cursor-pointer group shadow-sm"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold text-foreground block tracking-wide">{name} Interview</span>
                    <span className="text-xs text-muted-foreground mt-1 block font-semibold">1 Coding Question • DSA Focus</span>
                  </div>
                  <div className="p-2 bg-muted/30 border border-border/40 rounded-xl group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 text-muted-foreground">
                    <MessageSquareCode className="h-4.5 w-4.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedCompanies.length === 0 && (
        <div className="glass-panel border border-border/40 border-dashed py-16 text-center text-muted-foreground rounded-3xl relative z-10">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider">No target companies selected</h4>
          <p className="text-xs mt-1 text-muted-foreground font-semibold">Select one or more target companies above or search a custom company to unlock prep roadmaps.</p>
        </div>
      )}

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
                    className="w-full p-3 glass-input focus:ring-1 focus:ring-primary/20 resize-none h-20 leading-normal bg-card/20 text-foreground border border-border/30 rounded-xl"
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

export default InterviewPrep;
