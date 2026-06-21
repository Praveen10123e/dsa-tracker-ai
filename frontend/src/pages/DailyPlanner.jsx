import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  ExternalLink,
  TrendingUp,
  Loader2,
  ListTodo
} from 'lucide-react';

const DailyPlanner = () => {
  const { refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'todo', 'completed'
  
  // Custom Task Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState('problem');
  const [customPattern, setCustomPattern] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [xpPopup, setXpPopup] = useState(null); // { amount: number, text: string }

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks/today');
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (taskId) => {
    try {
      const res = await api.put(`/tasks/toggle/${taskId}`);
      
      // Update tasks in local state
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: res.data.task.status } : t));
      
      // If completed, trigger an XP reward popup animation
      if (res.data.xpEarned > 0) {
        setXpPopup({ amount: res.data.xpEarned, text: `+${res.data.xpEarned} XP Task Completed!` });
        setTimeout(() => setXpPopup(null), 3000);
      }
      
      await refreshUser(); // Refresh user profile (xp/level/streak changes)
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/tasks/create', {
        title: customTitle,
        type: customType,
        pattern: customPattern
      });
      setTasks([...tasks, res.data]);
      setCustomTitle('');
      setCustomPattern('');
    } catch (error) {
      console.error('Error creating custom task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/tasks/auto-generate');
      if (res.data.count === 0) {
        alert(res.data.message);
      } else {
        setTasks(res.data);
      }
    } catch (error) {
      console.error('Error auto-generating tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'todo') return task.status === 'todo';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const getTaskIconClass = (type) => {
    switch (type) {
      case 'revision': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'concept': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'mock': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      default: return 'bg-primary/10 text-primary-400 border border-primary/20';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-grid-pattern relative overflow-hidden min-h-screen">
      
      {/* Background glow blobs */}
      <div className="glow-blob top-10 right-10 w-96 h-96 bg-primary/10"></div>
      <div className="glow-blob bottom-10 left-10 w-96 h-96 bg-accent/10"></div>

      {/* Floating XP Gain Indicator */}
      {xpPopup && (
        <div className="fixed bottom-10 right-10 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold px-6 py-4 rounded-2xl shadow-glow-primary border border-emerald-400/20 flex items-center gap-2 animate-bounce">
          <TrendingUp className="h-5 w-5" />
          <span>{xpPopup.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-panel border border-border/40 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-10 shadow-sm">
        <div className="absolute right-10 top-0 w-36 h-36 bg-primary/10 blur-[60px] rounded-full pointer-events-none"></div>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-primary to-accent text-white rounded-xl shadow-glow-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Daily Practice Planner</h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
              Auto-rolls unfinished tasks and recommends problem plans.
            </p>
          </div>
        </div>
        <button
          onClick={handleAutoGenerate}
          className="self-start md:self-auto inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-glow-primary transition-all duration-200 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Auto-Generate Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Task Planner List (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className="flex bg-muted/45 p-1 rounded-xl border border-border/30 backdrop-blur-sm">
            {['all', 'todo', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                  filter === f
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-glow-primary font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Updating planner...</span>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div 
                  key={task._id}
                  className={`flex items-center justify-between p-4.5 glass-card border border-border/40 rounded-2xl transition-all duration-300 ${
                    task.status === 'completed' 
                      ? 'opacity-65 hover:opacity-80' 
                      : 'hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button 
                      onClick={() => handleToggle(task._id)}
                      className="text-muted-foreground hover:text-primary transition-colors cursor-pointer focus:outline-none"
                    >
                      {task.status === 'completed' ? (
                        <CheckSquare className="h-5 w-5 text-primary fill-primary/10" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${getTaskIconClass(task.type)}`}>
                        {task.type}
                      </span>
                      <h4 className={`font-extrabold text-sm text-foreground mt-1.5 tracking-wide leading-tight ${
                        task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {task.title}
                      </h4>
                      {task.pattern && (
                        <span className="text-xs text-muted-foreground font-semibold mt-1 block">
                          Pattern: <strong className="text-foreground">{task.pattern}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Solve link for Problem types */}
                  {task.problemId && task.status === 'todo' && (
                    <a
                      href={task.problemId.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-3.5 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-glow-primary transition-all duration-200 flex items-center gap-1 uppercase tracking-wider"
                    >
                      <span>Solve</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel border border-border/40 border-dashed rounded-3xl py-16 px-4 text-center text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider">All tasks complete!</h4>
              <p className="text-xs mt-1 text-muted-foreground font-semibold">No tasks found. Click "Auto-Generate Plan" or add custom goals.</p>
            </div>
          )}
        </div>

        {/* Custom Task Add Panel (1 col) */}
        <div className="glass-panel border border-border/40 p-6 rounded-3xl shadow-sm h-fit space-y-5">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4.5 w-4.5 text-primary" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Add Custom Task</h4>
          </div>
          
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Task Description</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Solve LC 121"
                className="w-full glass-input focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full glass-input focus:ring-1 focus:ring-primary/20 text-foreground"
              >
                <option value="problem" className="bg-[#0d1324] text-foreground">Problem Practice</option>
                <option value="revision" className="bg-[#0d1324] text-foreground">Spaced Repetition</option>
                <option value="concept" className="bg-[#0d1324] text-foreground">Concept Review</option>
                <option value="mock" className="bg-[#0d1324] text-foreground">Mock Interview</option>
              </select>
            </div>

            {/* Pattern Tag */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">DSA Pattern (Optional)</label>
              <input
                type="text"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
                placeholder="e.g., Sliding Window"
                className="w-full glass-input focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-glow-primary"
            >
              {isSubmitting ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4.5 w-4.5" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyPlanner;
