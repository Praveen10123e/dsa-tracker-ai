import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PATTERNS_DATA } from '../data/patternsData';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Award, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Patterns = () => {
  const { user } = useAuth();
  const [seedingAI, setSeedingAI] = useState(false);

  const handleBulkGenerateAI = async () => {
    try {
      setSeedingAI(true);
      const res = await api.post('/problems/generate-ai-bulk');
      alert(res.data.message || 'AI bulk generation completed successfully!');
    } catch (err) {
      console.error('AI bulk generation error:', err);
      alert(err.response?.data?.message || 'Failed to bulk generate problems');
    } finally {
      setSeedingAI(false);
    }
  };
  
  if (!user) return null;

  const patternsList = Object.entries(PATTERNS_DATA).map(([name, detail]) => {
    // Fetch mastery score from user's map (default to 0 if not set)
    const masteryScore = user.patternMastery?.[name] || 0;

    return {
      name,
      ...detail,
      masteryScore
    };
  });

  const getDifficultyClass = (diff) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Hard': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-grid-pattern relative overflow-hidden min-h-screen">
      
      {/* Background glow blobs */}
      <div className="glow-blob top-10 right-10 w-96 h-96 bg-primary/10"></div>
      <div className="glow-blob bottom-10 left-10 w-96 h-96 bg-accent/10"></div>

      {/* Header Section */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10 shadow-sm">
        <div className="absolute right-10 top-0 w-36 h-36 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-primary to-accent text-white rounded-xl shadow-glow-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">DSA Patterns Library</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
              Organized pattern-based learning paths to master key interview topics.
            </p>
          </div>
        </div>
        <button
          onClick={handleBulkGenerateAI}
          disabled={seedingAI}
          className="self-start md:self-auto inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-glow-primary transition-all duration-200 cursor-pointer"
        >
          <Sparkles className={`h-4 w-4 ${seedingAI ? 'animate-spin' : ''}`} />
          <span>{seedingAI ? 'Bulk Generating...' : 'Bulk Generate AI Problems'}</span>
        </button>
      </div>

      {/* Grid of Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {patternsList.map((pattern, idx) => (
          <div 
            key={idx}
            className="glass-card border border-border/40 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:border-primary/30"
          >
            <div>
              {/* Top Row: Title & Diff */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="font-extrabold text-sm text-foreground leading-tight tracking-wide">{pattern.name}</h3>
                <span className={`text-xs font-extrabold uppercase px-2 py-0.5 border rounded-full ${getDifficultyClass(pattern.difficulty)}`}>
                  {pattern.difficulty}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4 font-semibold">
                {pattern.description}
              </p>
            </div>

            <div>
              {/* Mastery progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5 font-bold uppercase tracking-wider">
                  <span>Topic Mastery</span>
                  <span className="text-foreground">{pattern.masteryScore}%</span>
                </div>
                <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden border border-border/10">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300"
                    style={{ width: `${pattern.masteryScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/patterns/${encodeURIComponent(pattern.name)}`}
                className="w-full py-2.5 bg-muted/30 hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white border border-border/60 hover:border-transparent rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer text-muted-foreground uppercase tracking-wider"
              >
                <span>Study Pattern</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Patterns;
