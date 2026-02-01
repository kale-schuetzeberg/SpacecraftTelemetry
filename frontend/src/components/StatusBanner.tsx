import './StatusBanner.css'

interface StatusBannerProps {
    status: 'nominal' | 'warning' | 'critical' | 'offline';
    missionTime: number;
}

function StatusBanner({status, missionTime}: StatusBannerProps) {
    // Convert seconds to HH:MM:SS format
    const hours = Math.floor(missionTime / 3600);
    const minutes = Math.floor((missionTime % 3600) / 60);
    const seconds = Math.floor(missionTime % 60);

    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div className={`status-banner status-${status.toLowerCase()}`}>
            <div className="status-label">
                STATUS: <strong>{status}</strong>
            </div>
            <div className="mission-time">
                Mission Time: <strong>{timeString}</strong>
            </div>
        </div>
    )
}

export default StatusBanner;