import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Heatmap from '../components/Heatmap';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Trophy, 
  Flame, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const ALL_BADGES = [
  { name: "First Problem Solved", desc: "Solve your very first DSA problem", icon: Sparkles, color: "from-blue-500 to-indigo-500" },
  { name: "7-Day Streak", desc: "Keep a daily solve streak for 7 days", icon: Flame, color: "from-orange-500 to-yellow-500" },
  { name: "DSA Apprentice", desc: "Solve 10 problems on the platform", icon: Trophy, color: "from-emerald-500 to-teal-500" },
  { name: "Algorithm Explorer", desc: "Solve 50 problems on the platform", icon: Award, color: "from-purple-500 to-pink-500" },
  { name: "Arrays Master", desc: "Achieve 100% mastery in Arrays pattern", icon: BookOpen, color: "from-cyan-500 to-blue-500" },
  { name: "Dynamic Programming Master", desc: "Achieve 100% mastery in DP pattern", icon: Sparkles, color: "from-red-500 to-pink-500" }
];

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [tasksCount, setTasksCount] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await refreshUser(); // Refresh user profile (xp, level, streak)
        
        // Fetch stats
        const statsRes = await api.get('/progress/stats');
        setStats(statsRes.data);

        // Fetch recommendations
        const recRes = await api.get('/problems/recommendations');
        setRecommendations(recRes.data);

        // Fetch today's tasks to count completeness
        const tasksRes = await api.get('/tasks/today');
        const completed = tasksRes.data.filter(t => t.status === 'completed').length;
        setTasksCount({ completed, total: tasksRes.data.length });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !user || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3 text-muted-foreground">
        <Sparkles className="h-10 w-10 text-primary animate-spin" />
        <span className="font-semibold text-sm">Synchronizing your dashboard...</span>
      </div>
    );
  }

  // Prep Recharts Radar Data (top 7 patterns for radar space constraints)
  const radarData = Object.entries(stats.patternMastery || {})
    .slice(0, 7)
    .map(([subject, score]) => ({
      subject,
      A: score,
      fullMark: 100,
    }));

  // Fallback if radarData is empty
  const defaultRadarData = [
    { subject: 'Arrays', A: 0, fullMark: 100 },
    { subject: 'Strings', A: 0, fullMark: 100 },
    { subject: 'Two Pointers', A: 0, fullMark: 100 },
    { subject: 'Sliding Window', A: 0, fullMark: 100 },
    { subject: 'Stack', A: 0, fullMark: 100 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-grid-pattern relative overflow-hidden min-h-screen">
      
      {/* Background glow blobs */}
      <div className="glow-blob top-10 right-10 w-96 h-96 bg-primary/10"></div>
      <div className="glow-blob bottom-10 left-10 w-96 h-96 bg-accent/10"></div>

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary/15 via-accent/5 to-transparent border border-primary/20 p-8 rounded-3xl relative overflow-hidden shadow-sm">
        <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-primary/10 blur-[80px]"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hey, <span className="text-primary">{user.username}</span>!
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5 font-bold uppercase tracking-wider">
            {user.streak > 0 
              ? `🔥 You are on a ${user.streak}-day solve streak! Keep it blazing.` 
              : "🚀 Start a solve streak by completing a task today!"}
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <Link 
            to="/planner" 
            className="px-5 py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all duration-200 shadow-glow-primary cursor-pointer flex items-center gap-1.5"
          >
            <span>Go to Planner</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
        {/* Metric 1: Solved */}
        <div className="glass-card border border-border/40 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Solved</span>
            <h3 className="text-3xl font-extrabold mt-1 tracking-tight text-gradient">{stats.totalSolved}</h3>
            <span className="text-xs text-muted-foreground/80 mt-1 block font-bold">Problems Mastered</span>
          </div>
          <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2: Today's Tasks */}
        <div className="glass-card border border-border/40 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daily Goal</span>
            <h3 className="text-3xl font-extrabold mt-1 tracking-tight text-gradient">{tasksCount.completed} / {tasksCount.total}</h3>
            <span className="text-xs text-muted-foreground/80 mt-1 block font-bold">Tasks Completed</span>
          </div>
          <div className="p-3 bg-accent/10 text-accent border border-accent/20 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3: Streak */}
        <div className="glass-card border border-border/40 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Solve Streak</span>
            <h3 className="text-3xl font-extrabold mt-1 tracking-tight text-orange-500 flex items-center gap-1">
              <Flame className="h-6 w-6 fill-current animate-pulse-slow" />
              <span>{user.streak} Days</span>
            </h3>
            <span className="text-xs text-muted-foreground/80 mt-1 block font-bold">Consecutive Days</span>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4: Spaced Repetition Queue */}
        <div className="glass-card border border-border/40 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Revision Due</span>
            <h3 className="text-3xl font-extrabold mt-1 tracking-tight text-red-500">{stats.revisionQueueCount}</h3>
            <span className="text-xs text-muted-foreground/80 mt-1 block font-bold">Spaced Repetition</span>
          </div>
          <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-2 glass-panel border border-border/45 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Weekly Solve Trend</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Quantity of problems solved per day</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyProgress}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => {
                    const d = new Date(tick);
                    return d.toLocaleDateString(undefined, { weekday: 'short' });
                  }}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.08)', 
                    borderRadius: '12px', 
                    fontSize: '10px',
                    color: '#f8fafc'
                  }} 
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pattern Mastery Radar Chart */}
        <div className="glass-panel border border-border/45 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="mb-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Pattern Strength</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Strength across core topics (%)</p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" radius="70%" data={radarData.length > 0 ? radarData : defaultRadarData}>
                <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="relative z-10 glass-panel border border-border/40 p-6 rounded-2xl shadow-sm">
        <Heatmap data={stats.heatmap} />
      </div>

      {/* Recommendations & Badges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
        
        {/* Recommendations Panel (3 cols) */}
        <div className="lg:col-span-3 glass-panel border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Recommended Problems</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Unsolved problems tailored to your current level and target companies</p>
          </div>

          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((prob) => (
                <div 
                  key={prob._id} 
                  className="flex items-center justify-between p-4 bg-muted/20 border border-border/30 rounded-xl hover:border-primary/40 transition-all duration-200 hover:bg-muted/30"
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
                      <span className="text-xs text-muted-foreground font-bold">{prob.platform}</span>
                    </div>
                    <h5 className="font-bold text-xs text-foreground mt-1 truncate">{prob.title}</h5>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground/80 font-medium">
                      <span>Pattern: <strong className="text-foreground">{prob.pattern}</strong></span>
                      <span>•</span>
                      <span>Est. {prob.estimatedSolveTime}m</span>
                    </div>
                  </div>
                  
                  <a
                    href={prob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 p-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                    title="Solve Problem"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <AlertCircle className="h-7 w-7 text-muted-foreground/60 mx-auto mb-2" />
                <span>No custom recommendations. Complete tasks to let AI analyze your weaknesses!</span>
              </div>
            )}
          </div>
        </div>

        {/* Gamified Badges (2 cols) */}
        <div className="lg:col-span-2 glass-panel border border-border/40 p-6 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Achievements</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Milestone rewards earned on your DSA journey</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar">
            {ALL_BADGES.map((badge, idx) => {
              const isEarned = user.badges.includes(badge.name);
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center justify-center p-3 text-center border rounded-xl transition-all duration-200 ${
                    isEarned 
                      ? 'bg-card/40 border-border/80 shadow-md scale-100 hover:scale-[1.02]' 
                      : 'bg-muted/5 border-border/20 opacity-30 select-none'
                  }`}
                >
                  <div className={`p-2 rounded-xl bg-gradient-to-tr ${badge.color} text-white shadow-sm mb-2`}>
                    <badge.icon className="h-4.5 w-4.5" />
                  </div>
                  <h6 className="font-bold text-xs text-foreground leading-tight">{badge.name}</h6>
                  <span className="text-xs text-muted-foreground mt-1 leading-tight">{badge.desc}</span>
                  {isEarned && (
                    <span className="text-xs text-primary font-bold mt-1.5 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      EARNED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
