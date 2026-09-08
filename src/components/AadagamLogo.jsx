import React from "react";

/**
 * AadagamLogo Component
 * Renders the official AaDaGaM brand logo
 * Variants: "horizontal" (default), "icon", "stacked"
 * Theme: "light" (dark text on white/light bg), "dark" (white text on black/dark bg)
 */
export default function AadagamLogo({
  variant = "horizontal",
  theme = "light",
  className = "",
  iconClassName = "",
  iconSrc = "/logo_without_backround.png",
  size = "md", // "sm", "md", "lg", "xl"
}) {
  const sizeMap = {
    sm: { height: "h-9", icon: "w-12 h-12", text: "text-lg sm:text-xl", sub: "text-[8px] sm:text-[9px]" },
    md: { height: "h-12", icon: "w-16 h-16 sm:w-20 sm:h-20 scale-125 origin-center", text: "text-2xl sm:text-[28px]", sub: "text-[9px] sm:text-[10.5px]" },
    lg: { height: "h-16", icon: "w-20 h-20 sm:w-24 sm:h-24 scale-125 origin-center", text: "text-3xl sm:text-4xl", sub: "text-[11px] sm:text-[13px]" },
    xl: { height: "h-24", icon: "w-28 h-28 sm:w-36 sm:h-36 scale-125 origin-center", text: "text-4xl sm:text-5xl", sub: "text-[14px] sm:text-[16px]" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const iconClasses = iconClassName || currentSize.icon;

  // Icon only variant
  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center justify-center overflow-visible ${className}`}>
        <img
          src={iconSrc}
          alt="AaDaGaM"
          className={`${iconClasses} object-contain select-none drop-shadow-xs`}
          onError={(e) => {
            if (iconSrc !== "/aadagam-logo-icon.png") {
              e.currentTarget.src = "/aadagam-logo-icon.png";
            }
          }}
        />
      </div>
    );
  }

  // Stacked variant (Mark on top, AaDaGaM + YOUR DIGITAL SHOWROOM below)
  if (variant === "stacked") {
    return (
      <div className={`inline-flex flex-col items-center justify-center text-center overflow-visible ${className}`}>
        <img
          src={iconSrc}
          alt="AaDaGaM Mark"
          className={`${iconClasses} object-contain mb-2 select-none drop-shadow-xs`}
          onError={(e) => {
            if (iconSrc !== "/aadagam-logo-icon.png") {
              e.currentTarget.src = "/aadagam-logo-icon.png";
            }
          }}
        />
        <span
          className={`font-black tracking-tight leading-none ${currentSize.text}`}
          style={{ color: "#783bf0" }}
        >
          AaDaGaM
        </span>
        <span
          className={`font-bold tracking-widest uppercase mt-1.5 ${currentSize.sub} ${
            theme === "dark" ? "text-stone-300" : "text-black"
          }`}
        >
          YOUR DIGITAL SHOWROOM
        </span>
      </div>
    );
  }

  // Default: Horizontal variant (Mark on left, "AaDaGaM" + "YOUR DIGITAL SHOWROOM" on right)
  return (
    <div className={`inline-flex items-center gap-3 sm:gap-4 select-none overflow-visible ${className}`}>
      <div className="flex items-center justify-center shrink-0">
        <img
          src={iconSrc}
          alt="AaDaGaM Mark"
          className={`${iconClasses} object-contain shrink-0 drop-shadow-xs`}
          onError={(e) => {
            if (iconSrc !== "/aadagam-logo-icon.png") {
              e.currentTarget.src = "/aadagam-logo-icon.png";
            }
          }}
        />
      </div>
      <div className="flex flex-col justify-center leading-tight">
        <span
          className={`font-black tracking-tight leading-none ${currentSize.text}`}
          style={{ color: "#783bf0" }}
        >
          AaDaGaM
        </span>
        <span
          className={`font-bold tracking-widest uppercase mt-1 ${currentSize.sub} ${
            theme === "dark" ? "text-stone-300" : "text-black"
          }`}
        >
          YOUR DIGITAL SHOWROOM
        </span>
      </div>
    </div>
  );
}
