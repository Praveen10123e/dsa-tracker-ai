import React from 'react';

const Heatmap = ({ data = {} }) => {
  // Generate days for the last 53 weeks (approx 1 year) ending on today
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    // Start from 371 days ago (53 weeks * 7 days) to align with a full grid nicely
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    // Roll back to the nearest Sunday to start the grid clean
    const startDay = startDate.getDay(); // 0 is Sunday
    startDate.setDate(startDate.getDate() - startDay);

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const days = getDaysArray();

  // Helper to format date as YYYY-MM-DD
  const formatDateString = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getColorClass = (count) => {
    if (!count || count === 0) return 'bg-muted/30 dark:bg-muted/20 hover:bg-muted/50';
    if (count === 1) return 'bg-primary/20 text-primary border border-primary/10 hover:bg-primary/30';
    if (count === 2) return 'bg-primary/40 text-primary border border-primary/20 hover:bg-primary/50';
    if (count === 3) return 'bg-primary/70 text-white hover:bg-primary/80';
    return 'bg-primary text-white hover:opacity-90 shadow-glow-primary';
  };

  // Month labels helper
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    let lastMonth = -1;

    days.forEach((day, index) => {
      // Check if it's the start of the week (Sunday)
      if (day.getDay() === 0 && index % 7 === 0) {
        const month = day.getMonth();
        if (month !== lastMonth) {
          labels.push({ text: months[month], index: Math.floor(index / 7) });
          lastMonth = month;
        }
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar">
      <div className="min-w-[760px] p-4 bg-card border border-border rounded-2xl">
        <h4 className="text-sm font-bold text-foreground mb-4">Consistency Calendar</h4>
        
        <div className="flex gap-2 text-xs">
          {/* Days of Week column */}
          <div className="grid grid-rows-7 h-[112px] gap-[3px] text-muted-foreground pr-2 font-semibold pt-[16px]">
            {dayLabels.map((lbl, idx) => (
              <span key={idx} className="h-[12px] leading-[12px] text-xs">
                {idx % 2 === 1 ? lbl : ''}
              </span>
            ))}
          </div>

          <div className="flex-1">
            {/* Months Header */}
            <div className="relative h-4 mb-1 text-xs text-muted-foreground font-semibold">
              {monthLabels.map((lbl, idx) => (
                <span 
                  key={idx} 
                  className="absolute"
                  style={{ left: `${lbl.index * 15}px` }}
                >
                  {lbl.text}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div 
              className="grid grid-flow-col grid-rows-7 gap-[3px] auto-cols-max"
              style={{ gridTemplateColumns: 'repeat(53, minmax(0, 1fr))' }}
            >
              {days.map((day, idx) => {
                const dateStr = formatDateString(day);
                const count = data[dateStr] || 0;
                
                return (
                  <div
                    key={idx}
                    className={`w-[12px] h-[12px] rounded-[2px] transition-colors cursor-pointer relative group ${getColorClass(count)}`}
                    title={`${dateStr}: ${count} problem(s) solved`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                      <div className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                        {count} solved on {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="w-1.5 h-1 bg-slate-900 transform rotate-45 -mt-0.5"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center gap-1.5 mt-3 text-xs text-muted-foreground font-medium pr-1">
          <span>Less</span>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-muted/30 dark:bg-muted/20"></div>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-primary/20"></div>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-primary/40"></div>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-primary/70"></div>
          <div className="w-[10px] h-[10px] rounded-[2px] bg-primary"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
