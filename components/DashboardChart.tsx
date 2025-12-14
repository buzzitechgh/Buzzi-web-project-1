import React from 'react';

interface ChartProps {
  data: number[];
  labels: string[];
  type?: 'line' | 'bar';
  color?: string;
  height?: number;
  title?: string;
}

const DashboardChart: React.FC<ChartProps> = ({ 
  data, 
  labels, 
  type = 'line', 
  color = '#3b82f6', 
  height = 200,
  title 
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 20;
  
  // Normalize data to fit height
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100; // Percentage width
    const y = 100 - ((val - min) / range) * 80 - 10; // Percentage height (inverted for SVG)
    return { x, y, val };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full">
      {title && <h3 className="text-gray-700 font-bold mb-4">{title}</h3>}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          
          {/* Grid Lines */}
          {[0, 25, 50, 75, 100].map(p => (
            <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="#f3f4f6" strokeWidth="0.5" />
          ))}

          {type === 'line' ? (
            <>
              {/* Area Fill */}
              <path
                d={`M0,100 ${points.map(p => `L${p.x},${p.y}`).join(' ')} L100,100 Z`}
                fill={color}
                fillOpacity="0.1"
              />
              {/* Line Stroke */}
              <path
                d={`M${points[0].x},${points[0].y} ${points.map(p => `L${p.x},${p.y}`).join(' ')}`}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke" 
              />
              {/* Points */}
              {points.map((p, i) => (
                <circle 
                  key={i} 
                  cx={p.x} 
                  cy={p.y} 
                  r="1.5" 
                  fill="white" 
                  stroke={color} 
                  strokeWidth="0.5"
                  vectorEffect="non-scaling-stroke"
                  className="hover:r-4 transition-all duration-300"
                >
                  <title>{labels[i]}: {p.val}</title>
                </circle>
              ))}
            </>
          ) : (
            // Bar Chart
            <g>
               {points.map((p, i) => {
                 const barHeight = 100 - p.y;
                 const barWidth = 80 / data.length;
                 return (
                   <rect
                     key={i}
                     x={p.x - (barWidth/2)}
                     y={p.y}
                     width={barWidth}
                     height={barHeight}
                     fill={color}
                     rx="1"
                     opacity="0.8"
                     className="hover:opacity-100 transition-opacity"
                   >
                     <title>{labels[i]}: {p.val}</title>
                   </rect>
                 );
               })}
            </g>
          )}
        </svg>
        
        {/* Labels */}
        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium px-1">
           {labels.map((label, i) => (
             <span key={i}>{label}</span>
           ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardChart;