import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Loader2,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Easy, Medium, Hard

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [revisionList, setRevisionList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress/stats');
      setStats(res.data);

      const progressRes = await api.get('/tasks/today'); // get today's tasks
      // To show revision items, let's query all tasks for today of type 'revision'
      const revisionTasks = progressRes.data.filter(t => t.type === 'revision');
      setRevisionList(revisionTasks);
    } catch (error) {
      console.error('Error fetching analytics details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-muted-foreground bg-grid-pattern relative">
        <div className="glow-blob top-10 right-10 w-96 h-96 bg-primary/10"></div>
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="font-bold text-xs uppercase tracking-widest">Aggregating progress metrics...</span>
      </div>
    );
  }

  // Prep Recharts Pie Data
  const pieData = [
    { name: 'Easy', value: stats.difficulty?.easy || 0 },
    { name: 'Medium', value: stats.difficulty?.medium || 0 },
    { name: 'Hard', value: stats.difficulty?.hard || 0 }
  ].filter(d => d.value > 0); // Only include greater than 0 to avoid Recharts errors

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
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Advanced Analytics</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
              Deep dive audits of solving velocities, spaced repetition states, and strengths.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* Difficulty Distribution Chart */}
        <div className="glass-panel border border-border/40 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[320px]">
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Difficulty Distribution</h4>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Solve count ratios by difficulty tag</p>
          </div>
          
          <div className="h-56 flex items-center justify-center pt-4">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: 'rgba(10, 15, 28, 0.85)', 
                      borderColor: 'rgba(255, 255, 255, 0.08)', 
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      fontSize: '11px',
                      color: '#f8fafc',
                      fontFamily: 'inherit'
                    }} 
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value, entry) => (
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">{value} ({entry.payload.value})</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-muted-foreground text-center font-semibold">
                Solve a problem first to generate distributions!
              </div>
            )}
          </div>
        </div>

        {/* Consistency Summary */}
        <div className="glass-panel border border-border/40 p-5 rounded-3xl shadow-sm flex flex-col justify-between min-h-[320px] space-y-4">
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Consistency Index</h4>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Frequency stats over the past 30 days</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-muted/20 border border-border/30 p-4.5 rounded-2xl text-center shadow-inner relative overflow-hidden group">
              <span className="text-xs text-muted-foreground font-extrabold block uppercase tracking-wider">Consistency Score</span>
              <strong className="text-2xl text-foreground font-black mt-1.5 block">{stats.consistencyScore}%</strong>
              <span className="text-xs text-muted-foreground mt-1 block font-semibold">Active days ratio</span>
            </div>

            <div className="bg-muted/20 border border-border/30 p-4.5 rounded-2xl text-center shadow-inner relative overflow-hidden group">
              <span className="text-xs text-muted-foreground font-extrabold block uppercase tracking-wider">Revision Queue</span>
              <strong className="text-2xl text-foreground font-black mt-1.5 block">{stats.revisionQueueCount} Items</strong>
              <span className="text-xs text-muted-foreground mt-1 block font-semibold">Due for review</span>
            </div>
          </div>

          <div className="p-4 bg-muted/20 border border-border/30 rounded-2xl flex items-center gap-3 text-xs text-muted-foreground font-semibold shadow-inner">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <span>Regular spaced repetitions prevent forgetting curves by 85%.</span>
          </div>
        </div>

      </div>

      {/* Weak Areas vs Strong Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        
        {/* Weak Areas */}
        <div className="glass-panel border border-border/40 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-500">
            <TrendingDown className="h-4.5 w-4.5" />
            <h4 className="font-extrabold text-xs text-foreground uppercase tracking-widest">Weak Patterns (&lt; 40%)</h4>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed font-semibold">
            The system recommends focusing on these patterns to solidify foundations.
          </p>

          <div className="space-y-2.5">
            {stats.weakAreas?.length > 0 ? (
              stats.weakAreas.map((area, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs font-bold">
                  <span className="text-foreground">{area.pattern}</span>
                  <span className="text-rose-500 font-extrabold">{area.score}% Mastery</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6 font-semibold">
                Great job! No weak patterns detected. Keep moving forward!
              </div>
            )}
          </div>
        </div>

        {/* Strong Areas */}
        <div className="glass-panel border border-border/40 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <TrendingUp className="h-4.5 w-4.5" />
            <h4 className="font-extrabold text-xs text-foreground uppercase tracking-widest">Strong Patterns (&ge; 75%)</h4>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed font-semibold">
            Topics where you have completed a majority of the practice problems.
          </p>

          <div className="space-y-2.5">
            {stats.strongAreas?.length > 0 ? (
              stats.strongAreas.map((area, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs font-bold">
                  <span className="text-foreground">{area.pattern}</span>
                  <span className="text-emerald-500 font-extrabold">{area.score}% Mastery</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6 font-semibold">
                No patterns reached 75% mastery yet. Solve more questions to list achievements.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Spaced Repetition Due Details */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl shadow-sm space-y-4 relative z-10">
        <div className="flex items-center gap-2 text-amber-500">
          <RotateCcw className="h-4.5 w-4.5" />
          <h4 className="font-extrabold text-xs text-foreground uppercase tracking-widest">Spaced Repetition Review Queue</h4>
        </div>
        <p className="text-sm text-muted-foreground mt-1 font-semibold">
          Problems scheduled for review today based on intervals (1d, 3d, 7d, 14d, 30d).
        </p>

        {revisionList.length > 0 ? (
          <div className="space-y-3 pt-2">
            {revisionList.map((task) => (
              <div 
                key={task._id} 
                className="flex items-center justify-between p-4.5 glass-card border border-border/40 rounded-2xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    REVISION DUE
                  </span>
                  <h5 className="font-extrabold text-sm text-foreground mt-2 truncate">{task.title}</h5>
                  <span className="text-xs text-muted-foreground mt-1 block font-semibold">Pattern: <strong className="text-foreground">{task.pattern}</strong></span>
                </div>
                
                {task.problemId && (
                  <a
                    href={task.problemId.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-3.5 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-glow-primary transition-all duration-200 flex items-center gap-1 uppercase tracking-wider"
                  >
                    <span>Revise</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground border border-border/40 border-dashed rounded-3xl font-semibold">
            All revision tasks completed! You are fully caught up with spaced repetitions.
          </div>
        )}
      </div>

    </div>
  );
};

export default Analytics;
