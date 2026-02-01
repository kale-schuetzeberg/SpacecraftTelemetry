import './TelemetryCard.css';

interface TelemetryCardProps {
    label: string;
    value: number;
    unit: string;
    precision?: number;
}

function TelemetryCard({ label, value, unit, precision = 1 }: TelemetryCardProps) {
    const formattedValue = value.toFixed(precision);

    return (
        <div className="telemetry-card">
            <div className='card-label'>{label}</div>
            <div className='card-value'>
                {formattedValue}
                <span className='card-unit'>{unit}</span>
            </div>
        </div>
    );
}

export default TelemetryCard;