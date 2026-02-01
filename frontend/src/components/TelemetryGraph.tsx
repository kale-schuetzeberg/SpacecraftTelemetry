import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './TelemetryGraph.css';

interface DataPoint {
  name: string;  // X-axis label (e.g., "10s ago")
  [key: string]: number | string;  // Y-axis values (dynamic keys)
}

interface TelemetryGraphProps {
  title: string;           // Graph title (e.g., "Altitude")
  data: DataPoint[];       // Array of data points
  lines: {                 // Array of lines to plot
    dataKey: string;       // Key in data object (e.g., "altitude")
    color: string;         // Line color (e.g., "#00d9ff")
    name: string;          // Legend label (e.g., "Altitude (km)")
  }[];
  yAxisLabel?: string;     // Optional Y-axis label
}

function TelemetryGraph({ title, data, lines, yAxisLabel }: TelemetryGraphProps) {
  return (
    <div className="telemetry-graph">
      <h3 className="graph-title">{title}</h3>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />

          <XAxis
            dataKey="name"
            stroke="#8b9dc3"
            tick={{ fill: '#8b9dc3', fontSize: 12 }}
          />

          <YAxis
            stroke="#8b9dc3"
            tick={{ fill: '#8b9dc3', fontSize: 12 }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#8b9dc3' } : undefined}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f3a',
              border: '1px solid #2a3f5f',
              borderRadius: '4px',
              color: '#e0e0e0'
            }}
          />

          {lines.length > 1 && <Legend wrapperStyle={{ color: '#8b9dc3' }} />}

          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              name={line.name}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TelemetryGraph;