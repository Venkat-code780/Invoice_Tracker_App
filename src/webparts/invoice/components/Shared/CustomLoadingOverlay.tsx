import * as React from "react";

const CustomLoadingOverlay: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        background: "rgba(255,255,255,0.8)",
      }}
    >
      <div className="custom-spinner"></div>
      <div style={{ marginTop: 8, fontSize: 14 }}>
        Loading records...
      </div>
    </div>
  );
};

export default CustomLoadingOverlay;
