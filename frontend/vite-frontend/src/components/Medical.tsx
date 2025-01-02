import React from "react";

const MedicalBackground: React.FC = () => {
  const svgStyles = {
    position: "absolute" as "absolute",
    opacity: 0.2,
    animation: "float 6s ease-in-out infinite",
  };

  return (
    <div style={{ position: "fixed", width: "100%", height: "100%", zIndex: 0, overflow: "hidden" }}>
      {/* Stethoscope */}
      <img
        src="/static/brain.png"
        alt="Stethoscope"
        style={{ ...svgStyles, top: "10%", left: "5%", width: "80px", animationDelay: "0s",filter: "drop-shadow(0 0 10px rgba(97, 218, 251, 0.7))",}}
        
      />
      {/* Pill */}
      <img
        src="/static/health-insurance.png"
        alt="Pill"
        style={{ ...svgStyles, top: "30%", right: "10%", width: "60px", animationDelay: "1s", filter: "drop-shadow(0 0 10px rgba(97, 218, 251, 0.7))", }}
      />
      {/* Syringe */}
      <img
        src="/static/healthcare.png"
        alt="Syringe"
        style={{ ...svgStyles, bottom: "20%", left: "15%", width: "70px", animationDelay: "2s",filter: "drop-shadow(0 0 10px rgba(97, 218, 251, 0.7))", }}
      />
      {/* Heartbeat */}
      <img
        src="/static/heartbeat.png"
        alt="Heartbeat"
        style={{ ...svgStyles, bottom: "10%", right: "5%", width: "80px", animationDelay: "3s",filter: "drop-shadow(0 0 10px rgba(97, 218, 251, 0.7))", }}
      />
      {/* Pill */}
      <img
        src="/static/pill.png"
        alt="Heartbeat"
        style={{ ...svgStyles, bottom: "10%", right: "5%", width: "80px", animationDelay: "3s",filter: "drop-shadow(0 0 10px rgba(97, 218, 251, 0.7))", }}
      />
    </div>
  );
};

export default MedicalBackground;
