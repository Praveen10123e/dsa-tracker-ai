import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Loader2,
  Medal
} from 'lucide-react';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/leaderboard');
        setRankings(res.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/25';
      case 2: return 'text-slate-400 bg-slate-400/10 border-slate-400/25';
      case 3: return 'text-amber-600 bg-amber-600/10 border-amber-600/25';
      default: return 'text-muted-foreground bg-muted border-border/40';
    }
  };

  const getRankIcon = (rank) => {
    if (rank <= 3) {
      return <Medal className="h-4.5 w-4.5 fill-current" />;
    }
    return <span className="text-xs font-black">{rank}</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-grid-pattern relative overflow-hidden min-h-screen">
      
      {/* Background glow blobs */}
      <div className="glow-blob top-10 right-10 w-96 h-96 bg-primary/10"></div>
      <div className="glow-blob bottom-10 left-10 w-96 h-96 bg-accent/10"></div>

      {/* Header Banner */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl relative overflow-hidden flex items-center justify-between z-10 shadow-sm">
        <div className="absolute right-10 top-0 w-36 h-36 bg-accent/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-primary to-accent text-white rounded-xl shadow-glow-primary">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Global Leaderboards</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
              Rankings of students by level, solved counts, and active streaks.
            </p>
          </div>
        </div>
      </div>

      {/* Podium Ranks (1, 2, 3) */}
      {!loading && rankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 relative z-10 items-end">
          {/* Rank 2 */}
          <div className="glass-card border border-border/40 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center order-2 md:order-1 relative min-h-[220px]">
            <div className="absolute top-4 left-4 text-xs font-extrabold text-slate-400 border border-slate-400/25 px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-400/5">
              Rank 2
            </div>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-slate-500/10 to-slate-400/20 text-slate-300 flex items-center justify-center font-black text-2xl uppercase border border-slate-400/25 mb-4 shadow-inner">
              {rankings[1].username.substring(0, 2)}
            </div>
            <h3 className="font-extrabold text-sm text-foreground truncate max-w-[150px] tracking-wide">{rankings[1].username}</h3>
            <span className="text-xs text-muted-foreground font-bold mt-1.5 uppercase tracking-wider">Level {rankings[1].level}</span>
            <div className="mt-4 text-xs text-muted-foreground font-black bg-muted/40 px-3.5 py-1.5 rounded-xl border border-border/30 uppercase tracking-wider">
              {rankings[1].xp} XP
            </div>
          </div>

          {/* Rank 1 */}
          <div className="glass-card border border-primary/50 p-8 rounded-[2rem] shadow-glow-primary flex flex-col items-center justify-center text-center order-1 md:order-2 relative scale-[1.04] md:-translate-y-2 z-10 bg-gradient-to-b from-primary/10 to-transparent min-h-[250px]">
            <div className="absolute top-4 left-4 text-xs font-extrabold text-yellow-500 border border-yellow-500/25 px-2.5 py-0.5 rounded-full bg-yellow-500/5 animate-pulse-slow uppercase tracking-wider">
              Rank 1
            </div>
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-yellow-500/25 to-yellow-400/10 text-yellow-500 flex items-center justify-center font-black text-3xl uppercase border border-yellow-500/30 mb-4 shadow-md shadow-yellow-500/10 animate-bounce-slow">
              {rankings[0].username.substring(0, 2)}
            </div>
            <h3 className="font-extrabold text-base text-foreground truncate max-w-[180px] tracking-wide">{rankings[0].username}</h3>
            <span className="text-sm text-primary font-black mt-1.5 flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 animate-pulse-slow" />
              <span>Level {rankings[0].level}</span>
            </span>
            <div className="mt-4 text-xs text-white font-black bg-gradient-to-r from-primary to-accent px-4.5 py-1.5 rounded-xl shadow-glow-primary uppercase tracking-wider">
              {rankings[0].xp} XP
            </div>
          </div>

          {/* Rank 3 */}
          <div className="glass-card border border-border/40 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center order-3 md:order-3 relative min-h-[220px]">
            <div className="absolute top-4 left-4 text-xs font-extrabold text-amber-600 border border-amber-600/25 px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-600/5">
              Rank 3
            </div>
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-600/10 to-amber-500/20 text-amber-500 flex items-center justify-center font-black text-2xl uppercase border border-amber-600/25 mb-4 shadow-inner">
              {rankings[2].username.substring(0, 2)}
            </div>
            <h3 className="font-extrabold text-sm text-foreground truncate max-w-[150px] tracking-wide">{rankings[2].username}</h3>
            <span className="text-xs text-muted-foreground font-bold mt-1.5 uppercase tracking-wider">Level {rankings[2].level}</span>
            <div className="mt-4 text-xs text-muted-foreground font-black bg-muted/40 px-3.5 py-1.5 rounded-xl border border-border/30 uppercase tracking-wider">
              {rankings[2].xp} XP
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl shadow-sm space-y-4 relative z-10">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Global Standings</h4>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">Syncing standings...</span>
          </div>
        ) : rankings.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-border/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/30 border-b border-border/30 text-muted-foreground font-bold uppercase tracking-wider text-xs">
                  <th className="p-3.5 pl-5 w-16">Rank</th>
                  <th className="p-3.5">Coder</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5">XP</th>
                  <th className="p-3.5">Streak</th>
                  <th className="p-3.5 text-right pr-5">Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {rankings.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/15 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center border ${getRankColor(row.rank)}`}>
                        {getRankIcon(row.rank)}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-foreground">{row.username}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-muted-foreground font-semibold">Level {row.level}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-muted-foreground font-semibold">{row.xp} XP</span>
                    </td>
                    <td className="p-3.5">
                      {row.streak > 0 ? (
                        <span className="text-streak-orange font-bold flex items-center gap-1">
                          <Flame className="h-4 w-4 fill-current" />
                          <span>{row.streak}d</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/45 font-semibold">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wide">
                        {row.badgesCount} Badges
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
            No rankings available yet.
          </div>
        )}
      </div>

    </div>
  );
};

export default Leaderboard;
