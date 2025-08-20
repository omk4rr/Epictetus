interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  color: "bullish" | "bearish" | "neutral";
}

export const Sparkline = ({ data, width, height, color }: SparklineProps) => {
  if (!data || data.length < 2) {
    return <div className={`w-[${width}px] h-[${height}px] bg-muted/20 rounded`} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const colorClass = {
    bullish: 'sparkline-positive',
    bearish: 'sparkline-negative',
    neutral: 'stroke-neutral'
  }[color];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        className={colorClass}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};