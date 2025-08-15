import React from "react";

interface SignatureBackgroundProps {
  children: React.ReactNode;
}

const SignatureBackground: React.FC<SignatureBackgroundProps> = ({ children }) => {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--x", `${x}%`);
    e.currentTarget.style.setProperty("--y", `${y}%`);
  };

  return (
    <div className="spotlight min-h-screen flex flex-col" onMouseMove={onMove}>
      {children}
    </div>
  );
};

export default SignatureBackground;
