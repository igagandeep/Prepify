interface CircularScoreProps {
  score: number; // 0–100
  size?: number;
}

export default function CircularScore({ score, size = 140 }: CircularScoreProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  const strokeColor =
    score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-700"
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>

      {/* Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-50 leading-none">
          {score}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}
