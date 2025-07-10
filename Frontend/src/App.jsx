import React, { useState, useEffect } from "react";
import { Monitor, Upload, Activity, Zap, Settings, Database, Target, AlertCircle } from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [features, setFeatures] = useState(null);
  const [label, setLabel] = useState(null);
  const [isTransposed, setIsTransposed] = useState(false);
  const [delimiter, setDelimiter] = useState(",");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [systemStatus, setSystemStatus] = useState('READY');
  const [animationKey, setAnimationKey] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSystemStatus('FILE_LOADED');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setSystemStatus('ANALYZING');
    setAnimationKey(prev => prev + 1);
    
    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n');
    const data = [];
    
    for (const line of lines) {
      const values = line.split(delimiter);
      for (const value of values) {
        const num = parseFloat(value.trim());
        if (!isNaN(num)) {
          data.push(num);
        }
      }
    }
    
    if (data.length === 0) {
      setSystemStatus('ERROR');
      setIsAnalyzing(false);
      return;
    }
    
    // Send to backend API
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const result = await response.json();
      setFeatures(result.features);
      setLabel(result.label);
      setSystemStatus('COMPLETE');
    } catch (error) {
      console.error('Error:', error);
      setSystemStatus('ERROR');
    }
    
    setIsAnalyzing(false);
  };

  const labels = ['ADF', 'FL', 'NS', 'NT', 'CT', 'TB', 'BE', 'AD'];
  
  const getStatusColor = () => {
    switch(systemStatus) {
      case 'READY': return 'status-blue';
      case 'FILE_LOADED': return 'status-yellow';
      case 'ANALYZING': return 'status-orange';
      case 'COMPLETE': return 'status-green';
      case 'ERROR': return 'status-red';
      default: return 'status-gray';
    }
  };

  return (
    <div style={styles.appBg}>
      {/* Animated Background */}
      <div style={styles.animatedBg}>
        <div style={styles.animatedBgGradient}></div>
        <div style={styles.animatedBgParticles}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                ...styles.animatedParticle,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div style={styles.mainWrapper}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={styles.headerRow}>
            <div style={styles.headerTitleGroup}>
              <div style={styles.headerIconBg}>
                <Monitor style={styles.headerIcon} />
              </div>
              <div>
                <h1 style={styles.headerTitle}>
                  MACHINE MONITORING SYSTEM
                </h1>
                <p style={styles.headerSubtitle}>Advanced Signal Processing & Classification</p>
              </div>
            </div>
            <div style={styles.headerStatusGroup}>
              <div style={styles.headerStatusBox}>
                <span style={styles.headerStatusLabel}>STATUS:</span>
                <span style={{...styles.headerStatusValue, ...styles[getStatusColor()]}}>
                  {systemStatus}
                </span>
              </div>
              <div style={styles.headerStatusDot}></div>
            </div>
          </div>
        </div>

        <div style={styles.mainGrid}>
          {/* Classification Panel */}
          <div style={{...styles.panel, ...styles.classificationPanel}}>
            <div style={{...styles.panelHeader, ...styles.classificationHeader}}>
              <Target style={{...styles.panelHeaderIcon, ...styles.classificationHeaderIcon}} />
              <h2 style={{...styles.panelTitle, ...styles.classificationTitle}}>CLASSIFICATION MATRIX</h2>
            </div>
            <div style={styles.classificationList}>
              {labels.map((option, index) => (
                <div
                  key={option}
                  style={{
                    ...styles.classificationRow,
                    ...(label === option ? styles.classificationRowActive : {})
                  }}
                >
                  <div style={styles.classificationLabelGroup}>
                    <div style={styles.classificationIndex}>{String(index + 1).padStart(2, '0')}</div>
                    <span style={styles.classificationLabel}>{option}</span>
                  </div>
                  <div style={styles.classificationStatusGroup}>
                    <div
                      style={{
                        ...styles.classificationStatusDot,
                        ...(label === option ? styles.classificationStatusDotActive : {})
                      }}
                    />
                    {label === option && (
                      <div style={styles.classificationPingGroup}>
                        <div style={styles.classificationPing}></div>
                        <div style={{...styles.classificationPing, ...styles.classificationPingDelay1}}></div>
                        <div style={{...styles.classificationPing, ...styles.classificationPingDelay2}}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Analysis Panel */}
          <div style={{...styles.panel, ...styles.featurePanel}}>
            <div style={{...styles.panelHeader, ...styles.featureHeader}}>
              <Activity style={{...styles.panelHeaderIcon, ...styles.featureHeaderIcon}} />
              <h2 style={{...styles.panelTitle, ...styles.featureTitle}}>FEATURE ANALYSIS</h2>
            </div>
            {label && (
              <div style={styles.featurePredictionBox}>
                <div style={styles.featurePredictionRow}>
                  <span style={styles.featurePredictionLabel}>PREDICTED CLASSIFICATION</span>
                  <AlertCircle style={styles.featurePredictionIcon} />
                </div>
                <div style={styles.featurePredictionValue}>{label}</div>
              </div>
            )}
            <div style={styles.featureList}>
              {features ? Object.entries(features).map(([key, value], index) => (
                <div key={key} style={styles.featureRow}>
                  <div style={styles.featureLabelGroup}>
                    <div style={styles.featureIndex}>{index + 1}</div>
                    <span style={styles.featureLabel}>{key}</span>
                  </div>
                  <div style={styles.featureValue}>
                    {typeof value === 'number' ? value.toFixed(4) : value}
                  </div>
                </div>
              )) : (
                ['Kurtosis', 'Standard Error', 'Maximum value', 'Skewness', 'Minimum value', 
                 'Range', 'Count', 'Summation', 'Variance', 'Standard Deviation', 'Median', 'Mean'].map((feature, index) => (
                  <div key={feature} style={{...styles.featureRow, ...styles.featureRowPlaceholder}}>
                    <div style={styles.featureLabelGroup}>
                      <div style={{...styles.featureIndex, ...styles.featureIndexPlaceholder}}>{index + 1}</div>
                      <span style={{...styles.featureLabel, ...styles.featureLabelPlaceholder}}>{feature}</span>
                    </div>
                    <div style={{...styles.featureValue, ...styles.featureValuePlaceholder}}>
                      ---.----
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div style={{...styles.panel, ...styles.controlPanel}}>
            <div style={{...styles.panelHeader, ...styles.controlHeader}}>
              <Settings style={{...styles.panelHeaderIcon, ...styles.controlHeaderIcon}} />
              <h2 style={{...styles.panelTitle, ...styles.controlTitle}}>CONTROL PANEL</h2>
            </div>
            <div style={styles.controlSection}>
              {/* File Upload */}
              <div style={styles.controlUploadBox}>
                <label style={styles.controlUploadLabel}>
                  DATA INPUT MODULE
                </label>
                <div style={styles.controlUploadRow}>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={styles.controlUploadInput}
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    style={styles.controlUploadBtn}
                  >
                    <Upload style={styles.controlUploadIcon} />
                  </label>
                  <div style={styles.controlUploadFilenameGroup}>
                    <div style={styles.controlUploadFilename}>
                      {file ? file.name : 'No file selected'}
                    </div>
                    <div style={styles.controlUploadFiletype}>
                      CSV format supported
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div style={styles.controlSettingsBox}>
                <div style={styles.controlSettingsRow}>
                  <input
                    type="checkbox"
                    checked={isTransposed}
                    onChange={(e) => setIsTransposed(e.target.checked)}
                    style={styles.controlCheckbox}
                    id="transpose-checkbox"
                  />
                  <label htmlFor="transpose-checkbox" style={styles.controlCheckboxLabel}>
                    Matrix Transpose (F)
                  </label>
                </div>
                <div style={styles.controlDelimiterGroup}>
                  <label style={styles.controlDelimiterLabel}>
                    Data Delimiter
                  </label>
                  <input
                    type="text"
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    style={styles.controlDelimiterInput}
                    placeholder=","
                  />
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                style={{
                  ...styles.controlAnalyzeBtn,
                  ...(!file || isAnalyzing ? styles.controlAnalyzeBtnDisabled : {})
                }}
              >
                {isAnalyzing ? (
                  <div style={styles.controlAnalyzingGroup}>
                    <div style={styles.controlAnalyzingSpinner}></div>
                    <span>ANALYZING...</span>
                  </div>
                ) : (
                  <div style={styles.controlAnalyzeGroup}>
                    <Zap style={styles.controlAnalyzeIcon} />
                    <span>ANALYZE DATA</span>
                  </div>
                )}
              </button>

              {/* Results */}
              {label && (
                <div style={styles.controlResultsBox}>
                  <div style={styles.controlResultsRow}>
                    <div style={styles.controlResultsDot}></div>
                    <span style={styles.controlResultsLabel}>ANALYSIS COMPLETE</span>
                  </div>
                  <div style={styles.controlResultsValue}>
                    CLASS: {label}
                  </div>
                  <div style={styles.controlResultsTime}>
                    Processing time: 1.247s
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  appBg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #2d3748 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden'
  },
  animatedBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1
  },
  animatedBgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)',
    animation: 'pulse 4s ease-in-out infinite'
  },
  animatedBgParticles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  animatedParticle: {
    position: 'absolute',
    width: '2px',
    height: '2px',
    background: '#38bdf8',
    borderRadius: '50%',
    animation: 'float 3s ease-in-out infinite'
  },
  mainWrapper: {
    position: 'relative',
    zIndex: 2,
    padding: '20px',
    minHeight: '100vh'
  },
  headerSection: {
    marginBottom: '30px',
    background: 'rgba(15, 20, 25, 0.8)',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: '20px',
    backdropFilter: 'blur(10px)'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  headerIconBg: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  headerIcon: {
    width: '32px',
    height: '32px',
    color: '#ffffff'
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    background: 'linear-gradient(45deg, #ffffff, #94a3b8)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent'
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '5px 0 0 0',
    fontWeight: '500'
  },
  headerStatusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  headerStatusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    background: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '8px',
    border: '1px solid #475569'
  },
  headerStatusLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '600'
  },
  headerStatusValue: {
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  headerStatusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#22c55e',
    animation: 'pulse 2s ease-in-out infinite'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
    alignItems: 'start'
  },
  panel: {
    background: 'rgba(15, 20, 25, 0.8)',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
    minHeight: '400px'
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #374151'
  },
  panelHeaderIcon: {
    width: '24px',
    height: '24px'
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  classificationPanel: {},
  classificationHeader: {},
  classificationHeaderIcon: {
    color: '#f59e0b'
  },
  classificationTitle: {
    color: '#f59e0b'
  },
  classificationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  classificationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '8px',
    border: '1px solid #475569',
    transition: 'all 0.3s ease'
  },
  classificationRowActive: {
    background: 'rgba(34, 197, 94, 0.2)',
    border: '1px solid #22c55e',
    boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
  },
  classificationLabelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  classificationIndex: {
    width: '24px',
    height: '24px',
    background: '#374151',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#94a3b8'
  },
  classificationLabel: {
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  classificationStatusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative'
  },
  classificationStatusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#6b7280'
  },
  classificationStatusDotActive: {
    background: '#22c55e',
    boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)'
  },
  classificationPingGroup: {
    position: 'absolute',
    right: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  classificationPing: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: '2px solid #22c55e',
    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
  },
  classificationPingDelay1: {
    animationDelay: '0.2s'
  },
  classificationPingDelay2: {
    animationDelay: '0.4s'
  },
  featurePanel: {},
  featureHeader: {},
  featureHeaderIcon: {
    color: '#8b5cf6'
  },
  featureTitle: {
    color: '#8b5cf6'
  },
  featurePredictionBox: {
    background: 'rgba(139, 92, 246, 0.1)',
    border: '1px solid #8b5cf6',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  },
  featurePredictionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  featurePredictionLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  featurePredictionIcon: {
    width: '16px',
    height: '16px',
    color: '#8b5cf6'
  },
  featurePredictionValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    fontFamily: 'monospace',
    marginBottom: '4px'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(30, 41, 59, 0.5)',
    borderRadius: '6px',
    border: '1px solid #475569',
    transition: 'background-color 0.2s ease'
  },
  featureRowPlaceholder: {
    opacity: 0.5
  },
  featureLabelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  featureIndex: {
    width: '20px',
    height: '20px',
    background: '#374151',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#94a3b8'
  },
  featureIndexPlaceholder: {
    background: '#1f2937'
  },
  featureLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#e2e8f0'
  },
  featureLabelPlaceholder: {
    color: '#6b7280'
  },
  featureValue: {
    fontSize: '13px',
    fontFamily: 'monospace',
    color: '#94a3b8',
    fontWeight: '600'
  },
  featureValuePlaceholder: {
    color: '#4b5563'
  },
  controlPanel: {},
  controlHeader: {},
  controlHeaderIcon: {
    color: '#06b6d4'
  },
  controlTitle: {
    color: '#06b6d4'
  },
  controlSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  controlUploadBox: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '16px'
  },
  controlUploadLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: '12px',
    display: 'block'
  },
  controlUploadRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  controlUploadInput: {
    display: 'none'
  },
  controlUploadBtn: {
    width: '40px',
    height: '40px',
    background: '#06b6d4',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    border: 'none'
  },
  controlUploadIcon: {
    width: '20px',
    height: '20px',
    color: '#ffffff'
  },
  controlUploadFilenameGroup: {
    flex: 1
  },
  controlUploadFilename: {
    fontSize: '14px',
    color: '#e2e8f0',
    fontWeight: '500'
  },
  controlUploadFiletype: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },
  controlSettingsBox: {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  controlSettingsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  controlCheckbox: {
    width: '16px',
    height: '16px',
    accentColor: '#06b6d4'
  },
  controlCheckboxLabel: {
    fontSize: '14px',
    color: '#e2e8f0',
    fontWeight: '500'
  },
  controlDelimiterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  controlDelimiterLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '600'
  },
  controlDelimiterInput: {
    padding: '8px 12px',
    background: 'rgba(15, 20, 25, 0.8)',
    border: '1px solid #374151',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'monospace'
  },
  controlAnalyzeBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  controlAnalyzeBtnDisabled: {
    background: '#374151',
    cursor: 'not-allowed',
    opacity: 0.6

  },
  controlAnalyzeGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  controlAnalyzeIcon: {
    width: '18px',
    height: '18px'
  },
  controlAnalyzingGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  controlAnalyzingSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid #374151',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  controlResultsBox: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid #22c55e',
    borderRadius: '8px',
    padding: '16px'
  },
  controlResultsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  controlResultsDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    animation: 'pulse 2s ease-in-out infinite'
  },
  controlResultsLabel: {
    fontSize: '12px',
    color: '#22c55e',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  controlResultsValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#22c55e',
    fontFamily: 'monospace',
    marginBottom: '4px'
  },
  controlResultsTime: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500'
  },
  statusBlue: {
    color: '#3b82f6'
  },
  statusYellow: {
    color: '#f59e0b'
  },
  statusOrange: {
    color: '#f97316'
  },
  statusGreen: {
    color: '#22c55e'
  },
  statusRed: {
    color: '#ef4444'
  },
  statusGray: {
    color: '#6b7280'
  }
};

export default App;