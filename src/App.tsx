import { useState, useEffect } from 'react';
import { Droplet, Plus, Bell, BellOff, Settings, X, Check, GlassWater, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WeeklyChart from './components/WeeklyChart';

const THEMES = {
  blue: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    text: 'text-blue-500',
    textLight: 'text-blue-400',
    lightBg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    hex: '#3b82f6',
    glow: 'shadow-blue-500/20'
  },
  emerald: {
    bg: 'bg-emerald-500',
    hover: 'hover:bg-emerald-600',
    text: 'text-emerald-500',
    textLight: 'text-emerald-400',
    lightBg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    hex: '#10b981',
    glow: 'shadow-emerald-500/20'
  },
  violet: {
    bg: 'bg-violet-500',
    hover: 'hover:bg-violet-600',
    text: 'text-violet-500',
    textLight: 'text-violet-400',
    lightBg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    hex: '#8b5cf6',
    glow: 'shadow-violet-500/20'
  },
  rose: {
    bg: 'bg-rose-500',
    hover: 'hover:bg-rose-600',
    text: 'text-rose-500',
    textLight: 'text-rose-400',
    lightBg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    hex: '#f43f5e',
    glow: 'shadow-rose-500/20'
  },
  amber: {
    bg: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    text: 'text-amber-500',
    textLight: 'text-amber-400',
    lightBg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    hex: '#f59e0b',
    glow: 'shadow-amber-500/20'
  }
};
type ThemeKey = keyof typeof THEMES;

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function App() {
  const todayKey = getTodayKey();
  const [history, setHistory] = useState<Record<string, number>>({});
  const [goal, setGoal] = useState(2000); // 2000ml default
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationInterval, setNotificationInterval] = useState(120);
  const [toast, setToast] = useState<{title: string, body: string} | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [themeKey, setThemeKey] = useState<ThemeKey>('blue');
  const [resetTodayState, setResetTodayState] = useState(false);
  const [resetAllState, setResetAllState] = useState(false);

  const theme = THEMES[themeKey];

  useEffect(() => {
    setIsClient(true);
    const storedHistory = localStorage.getItem('water-tracker-history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error(e);
      }
    }
    const storedGoal = localStorage.getItem('water-tracker-goal');
    if (storedGoal) setGoal(Number(storedGoal));

    const storedInterval = localStorage.getItem('water-tracker-interval');
    if (storedInterval) setNotificationInterval(Number(storedInterval));
    
    const storedNotifs = localStorage.getItem('water-tracker-notifs');
    if (storedNotifs) {
      setNotificationsEnabled(storedNotifs === 'true');
    } else if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }

    const storedTheme = localStorage.getItem('water-tracker-theme');
    if (storedTheme && THEMES[storedTheme as ThemeKey]) {
      setThemeKey(storedTheme as ThemeKey);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('water-tracker-theme', themeKey);
    }
  }, [themeKey, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('water-tracker-notifs', String(notificationsEnabled));
    }
  }, [notificationsEnabled, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('water-tracker-history', JSON.stringify(history));
    }
  }, [history, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('water-tracker-goal', String(goal));
    }
  }, [goal, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('water-tracker-interval', String(notificationInterval));
    }
  }, [notificationInterval, isClient]);

  const addWater = (amount: number) => {
    setHistory(prev => {
      const current = prev[todayKey] || 0;
      const newAmount = current + amount;
      
      if (current < goal && newAmount >= goal && notificationsEnabled) {
        sendNotification("Goal Reached! \u{1F31F}", "Great job! You've met your daily water intake goal.");
      }
      
      return {
        ...prev,
        [todayKey]: newAmount
      };
    });
  };

  const currentIntake = history[todayKey] || 0;
  const progress = Math.min((currentIntake / goal) * 100, 100);

  const requestNotificationPermission = async () => {
    try {
      if ("Notification" in window && Notification.permission !== "denied" && Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    } catch (e) {
      console.log("Desktop notifications blocked or not supported, using in-app only.");
    }
    
    setNotificationsEnabled(true);
    sendNotification("Notifications Enabled", "You'll now receive water reminders.");
  };

  const sendNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
    // Fallback/in-app alert
    setToast({ title, body });
    setTimeout(() => setToast(null), 5000);
  };

  // Reminder interval
  useEffect(() => {
    if (!notificationsEnabled || currentIntake >= goal) return;

    const intervalMs = notificationInterval * 60 * 1000;
    const interval = setInterval(() => {
      sendNotification("Time to hydrate! \u{1F4A7}", "Drink some water to reach your daily goal.");
    }, intervalMs);

    return () => clearInterval(interval);
  }, [notificationsEnabled, currentIntake, goal, notificationInterval]);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans selection:bg-slate-800">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden relative border border-slate-800/60">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div 
              className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 select-none"
              style={{ textShadow: '0 1px 0 #1e293b, 0 2px 0 #0f172a, 0 3px 0 #020617, 0 4px 10px rgba(0,0,0,0.5)' }}
            >
              DARK
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-8 flex flex-col items-center">
          
          {/* Progress Circle */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="128" cy="128" r="116" 
                stroke="currentColor" 
                strokeWidth="16" 
                fill="transparent" 
                className="text-slate-800/50" 
              />
              <circle 
                cx="128" cy="128" r="116" 
                stroke="currentColor" 
                strokeWidth="16" 
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={116 * 2 * Math.PI}
                strokeDashoffset={116 * 2 * Math.PI - (progress / 100) * 116 * 2 * Math.PI}
                className={`${theme.text} transition-all duration-1000 ease-out`}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {progress >= 100 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`${theme.lightBg} ${theme.text} p-2 rounded-full mb-1 border ${theme.border}`}
                >
                  <Trophy className="w-6 h-6" />
                </motion.div>
              )}
              <div className="text-4xl font-bold text-white tracking-tight">
                {currentIntake}
              </div>
              <div className="text-sm font-medium text-slate-400 mt-1">
                of {goal} ml
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-4">
            <button
              onClick={() => addWater(250)}
              className={`flex items-center justify-center gap-2 py-4 px-4 ${theme.lightBg} hover:bg-slate-800 ${theme.text} rounded-2xl font-semibold transition-colors active:scale-95 border border-transparent hover:${theme.border}`}
            >
              <GlassWater className="w-5 h-5" />
              +250 ml
            </button>
            <button
              onClick={() => addWater(500)}
              className={`flex items-center justify-center gap-2 py-4 px-4 ${theme.bg} ${theme.hover} text-white rounded-2xl font-semibold transition-colors shadow-lg ${theme.glow} active:scale-95`}
            >
              <Droplet className="w-5 h-5 fill-current" />
              +500 ml
            </button>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-6">
            <button
              onClick={() => setHistory({ ...history, [todayKey]: Math.max(0, currentIntake - 250) })}
              disabled={currentIntake === 0}
              className="text-sm text-slate-500 hover:text-slate-300 font-medium disabled:opacity-50 transition-colors"
            >
              Undo last action
            </button>
            <div className="w-px h-4 bg-slate-800"></div>
            <button
              onClick={() => {
                if (resetTodayState) {
                  setHistory({ ...history, [todayKey]: 0 });
                  setResetTodayState(false);
                } else {
                  setResetTodayState(true);
                  setTimeout(() => setResetTodayState(false), 3000);
                }
              }}
              disabled={currentIntake === 0}
              className={`text-sm font-medium disabled:opacity-50 transition-colors ${resetTodayState ? 'text-red-500 hover:text-red-400' : 'text-slate-500 hover:text-red-400'}`}
            >
              {resetTodayState ? "Tap again to reset" : "Reset today"}
            </button>
          </div>

          <WeeklyChart history={history} goal={goal} theme={theme} />

        </div>

        {/* Settings Overlay */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-slate-900 z-10 flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-800/50">
                <h2 className="text-xl font-semibold tracking-tight text-white">Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-8">
                {/* Theme Color */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white uppercase tracking-wider">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-4">
                    {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, t]) => (
                      <button
                        key={key}
                        onClick={() => setThemeKey(key)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${t.bg} ${themeKey === key ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-110'}`}
                      >
                        {themeKey === key && <Check className="w-5 h-5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Goal */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white uppercase tracking-wider">
                    Daily Goal (ml)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={goal}
                      onChange={(e) => setGoal(Math.max(100, Number(e.target.value)))}
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white uppercase tracking-wider">
                    Reminders
                  </label>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800/50">
                    <div className="flex items-center gap-3">
                      {notificationsEnabled ? (
                        <div className={`w-10 h-10 rounded-full ${theme.lightBg} flex items-center justify-center ${theme.text}`}>
                          <Bell className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                          <BellOff className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">Smart Notifications</div>
                        <div className="text-xs text-slate-400 mt-0.5">Reminds you based on interval</div>
                      </div>
                    </div>
                    
                    {!notificationsEnabled ? (
                      <button 
                        onClick={requestNotificationPermission}
                        className={`px-4 py-2 ${theme.bg} ${theme.hover} text-white text-sm font-semibold rounded-lg transition-colors`}
                      >
                        Enable
                      </button>
                    ) : (
                      <button 
                        onClick={() => setNotificationsEnabled(false)}
                        className="flex items-center gap-1 text-sm font-medium text-slate-400 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Disable
                      </button>
                    )}
                  </div>
                  {notificationsEnabled && (
                    <div className="mt-4 space-y-3">
                      <label className="text-sm font-semibold text-white uppercase tracking-wider">
                        Notification Interval (minutes)
                      </label>
                      <input
                        type="number"
                        value={notificationInterval}
                        onChange={(e) => setNotificationInterval(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => sendNotification("Test Notification", "This is how reminders will look.")}
                        className={`text-sm ${theme.textLight} hover:text-white font-medium pt-2 block transition-colors`}
                      >
                        Test notification
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Reset Data */}
                <div className="space-y-3 pt-6 border-t border-slate-800/50">
                  <label className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                    Danger Zone
                  </label>
                  <button
                    onClick={() => {
                      if (resetAllState) {
                        setHistory({});
                        setGoal(2000);
                        setShowSettings(false);
                        setResetAllState(false);
                      } else {
                        setResetAllState(true);
                        setTimeout(() => setResetAllState(false), 3000);
                      }
                    }}
                    className={`w-full px-4 py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${resetAllState ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400'}`}
                  >
                    {resetAllState ? "Tap again to confirm reset" : "Reset all data"}
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* In-app Toast Alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
              animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
              exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
              className="fixed bottom-6 left-1/2 w-[calc(100%-2rem)] max-w-sm bg-slate-800 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 z-[100] border border-slate-700"
            >
              <div className={`${theme.lightBg} p-2 rounded-full ${theme.text}`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{toast.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{toast.body}</p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
