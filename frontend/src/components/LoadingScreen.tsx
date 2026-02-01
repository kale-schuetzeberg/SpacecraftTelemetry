import './LoadingScreen.css'

interface LoadingScreenProps {
    isConnected: boolean;
}

function LoadingScreen({isConnected}: LoadingScreenProps) {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <p className="loading-text">
                    {isConnected ? 'Waiting for telemetry...' : 'Connecting to spacecraft...'}
                </p>
            </div>
        </div>
    );
}

export default LoadingScreen;