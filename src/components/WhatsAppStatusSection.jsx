import React, { useState, useEffect } from "react";
import { Download, Sparkles, Video, Image, CheckCircle2, Loader2, X, Play } from "lucide-react";
import { getSiteInfo, getBasicAssets } from "../services/api";
import { getTenantSubdomain, getShopPrefix, resolveFullImageUrl } from "../services/apiClient";

// ==========================================
// CANVAS VECTOR EMBLEM & OVERLAY DRAWING HELPERS
// ==========================================

/**
 * Draws the Shop Logo inside a luxury metallic gold medallion badge or monogram emblem on Canvas
 */
const drawShopLogoBadge = (ctx, centerX, centerY, radius, shopLogoImg, shopName, scale = 1) => {
  ctx.save();
  
  // Outer Metallic Gold Gradient Ring
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 12 * scale;

  const outerGoldGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
  outerGoldGrad.addColorStop(0, "#78590F");
  outerGoldGrad.addColorStop(0.3, "#D4AF37");
  outerGoldGrad.addColorStop(0.7, "#FFF6D4");
  outerGoldGrad.addColorStop(1, "#9E7B15");

  ctx.fillStyle = outerGoldGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  if (shopLogoImg && shopLogoImg.complete && shopLogoImg.naturalWidth > 0) {
    // Inner Soft Ivory Background Badge for Clean Logo Visibility
    const innerRadius = radius - 3.5 * scale;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Clip & Render Logo
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2 * scale, 0, Math.PI * 2);
    ctx.clip();
    
    const aspect = shopLogoImg.naturalWidth / shopLogoImg.naturalHeight;
    let drawW = innerRadius * 1.68;
    let drawH = drawW / aspect;
    if (drawH > innerRadius * 1.68) {
      drawH = innerRadius * 1.68;
      drawW = drawH * aspect;
    }
    ctx.drawImage(shopLogoImg, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    ctx.restore();

    // Subtle Gold Inner Rim
    ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Luxury Shop Monogram Crest Medallion (Fallback when shop image logo is not set)
    const innerRadius = radius - 4 * scale;
    const innerGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    innerGrad.addColorStop(0, "#241804");
    innerGrad.addColorStop(1, "#0A0601");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#FDE68A";
    ctx.lineWidth = 1.8 * scale;
    ctx.stroke();

    // Monogram Initial Letter
    const shopInitial = (shopName || "S").trim().charAt(0).toUpperCase();
    ctx.shadowColor = "rgba(212, 175, 55, 0.7)";
    ctx.shadowBlur = 8 * scale;
    ctx.fillStyle = "#FDE68A";
    ctx.font = `bold ${Math.round(radius * 1.05)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(shopInitial, centerX, centerY + 2 * scale);
  }
  
  ctx.restore();
};

const loadSingleImage = (url) => {
  return new Promise(async (resolve) => {
    if (!url) return resolve(null);
    const fullUrl = resolveFullImageUrl(url);

    // If already a Data URL or Blob URL, it's 100% CORS-clean on canvas
    if (fullUrl.startsWith("data:") || fullUrl.startsWith("blob:")) {
      const img = new window.Image();
      img.onload = () => {
        img.isCorsClean = true;
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = fullUrl;
      return;
    }

    // Stage 1: Try direct fetch to convert to Base64 Data URL (Data URLs NEVER taint canvas!)
    try {
      let blob = null;
      try {
        const res = await fetch(fullUrl, { mode: "cors" });
        if (res.ok) blob = await res.blob();
      } catch (e) {}

      if (!blob && fullUrl.startsWith("/")) {
        try {
          const res = await fetch(window.location.origin + fullUrl);
          if (res.ok) blob = await res.blob();
        } catch (e) {}
      }

      if (blob) {
        const dataUrl = await new Promise((resReader) => {
          const reader = new FileReader();
          reader.onloadend = () => resReader(reader.result);
          reader.onerror = () => resReader(null);
          reader.readAsDataURL(blob);
        });

        if (dataUrl) {
          const dataImg = new window.Image();
          const loaded = await new Promise((resImg) => {
            dataImg.onload = () => {
              dataImg.isCorsClean = true;
              resImg(dataImg);
            };
            dataImg.onerror = () => resImg(null);
            dataImg.src = dataUrl;
          });
          if (loaded) return resolve(loaded);
        }
      }
    } catch (e) {}

    // Stage 2: Try direct anonymous CORS image load
    try {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = fullUrl;
      const loadedImg = await new Promise((resImg) => {
        img.onload = () => {
          img.isCorsClean = true;
          resImg(img);
        };
        img.onerror = () => resImg(null);
      });
      if (loadedImg) return resolve(loadedImg);
    } catch (e) {}

    // Stage 3: Fetch via CORS proxies to convert to Base64 Data URL (with PNG format output)
    const cleanUrl = fullUrl.replace(/^https?:\/\//, "");
    const fullEncoded = encodeURIComponent(fullUrl);
    const proxyCandidates = [
      `https://wsrv.nl/?url=${fullEncoded}&output=png`,
      `https://images.weserv.nl/?url=${fullEncoded}&output=png`,
      `https://wsrv.nl/?url=${cleanUrl}&output=png`,
      `https://images.weserv.nl/?url=${cleanUrl}&output=png`,
      `https://api.codetabs.com/v1/proxy?quest=${fullEncoded}`,
      `https://corsproxy.io/?${fullEncoded}`,
      `https://api.allorigins.win/raw?url=${fullEncoded}`
    ];

    for (const pUrl of proxyCandidates) {
      try {
        const res = await fetch(pUrl);
        if (res.ok) {
          const blob = await res.blob();
          const dataUrl = await new Promise((resReader) => {
            const reader = new FileReader();
            reader.onloadend = () => resReader(reader.result);
            reader.onerror = () => resReader(null);
            reader.readAsDataURL(blob);
          });

          if (dataUrl) {
            const dataImg = new window.Image();
            const loaded = await new Promise((resImg) => {
              dataImg.onload = () => {
                dataImg.isCorsClean = true;
                resImg(dataImg);
              };
              dataImg.onerror = () => resImg(null);
              dataImg.src = dataUrl;
            });
            if (loaded) return resolve(loaded);
          }
        }
      } catch (e) {}
    }

    // Stage 4: Fallback direct load
    const fallbackImg = new window.Image();
    fallbackImg.onload = () => {
      fallbackImg.isCorsClean = true;
      resolve(fallbackImg);
    };
    fallbackImg.onerror = () => resolve(null);
    fallbackImg.src = fullUrl;
  });
};

/**
  * Robust logo loader that tries primary URL first and falls back to main site logo options
  */
const loadLogoWithFallback = async (primaryUrl) => {
  const candidates = [
    primaryUrl,
    "/logo_without_backround.png",
    "/aadagam-logo-icon.png",
    "/aadagam-logo.png",
    "/logo.png"
  ].filter(Boolean);

  for (const url of candidates) {
    const img = await loadSingleImage(url);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
  }
  return null;
};

/**
 * Draws crisp, professional Vector Icon Badges (Phone & Pin) on Canvas — No OS Emoji reliance!
 */
const drawVectorIconBadge = (ctx, centerX, centerY, radius, type, scale, accentColor = "#D4AF37") => {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 8 * scale;

  // Outer Gold Pill / Circle Badge
  const goldGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
  goldGrad.addColorStop(0, "#D4AF37");
  goldGrad.addColorStop(0.5, "#FFF6D4");
  goldGrad.addColorStop(1, "#8A6B0E");

  ctx.fillStyle = "rgba(18, 12, 5, 0.9)";
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = accentColor;
  ctx.strokeStyle = accentColor;

  if (type === "phone") {
    // Vector Phone Handset
    ctx.save();
    ctx.translate(centerX, centerY);
    const s = (radius * 0.9) / 24;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.bezierCurveTo(-8, -9, -9, -7, -9, -5);
    ctx.bezierCurveTo(-9, 3, -3, 9, 5, 9);
    ctx.bezierCurveTo(7, 9, 9, 8, 9, 6);
    ctx.lineTo(7, 2);
    ctx.bezierCurveTo(6, 1, 4, 1, 3, 2);
    ctx.lineTo(1.5, 3.5);
    ctx.bezierCurveTo(-1.5, 1.5, -2.5, 0.5, -4.5, -2.5);
    ctx.lineTo(-3, -4);
    ctx.bezierCurveTo(-2, -5, -2, -6.5, -3, -7.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (type === "pin") {
    // Vector Location Map Pin Marker
    ctx.save();
    ctx.translate(centerX, centerY);
    const s = (radius * 0.9) / 24;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(0, -3, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.lineTo(-5.5, -2);
    ctx.bezierCurveTo(-5.5, -5, 5.5, -5, 5.5, -2);
    ctx.closePath();
    ctx.fill();
    // Inner dot
    ctx.fillStyle = "rgba(18, 12, 5, 0.95)";
    ctx.beginPath();
    ctx.arc(0, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};

/**
 * Draws the Authentic, Official Gold BIS 916 Hallmark Logo Image on Canvas
 */
const drawRealBIS916Hallmark = (ctx, centerX, centerY, scale = 1, style = "gold", hallmarkImg = null) => {
  ctx.save();
  
  if (hallmarkImg && hallmarkImg.complete && hallmarkImg.naturalWidth > 0 && hallmarkImg.isCorsClean !== false) {
    const aspect = hallmarkImg.naturalWidth / hallmarkImg.naturalHeight;
    const drawW = 210 * scale;
    const drawH = drawW / aspect;
    const drawX = centerX - drawW / 2;
    const drawY = centerY - drawH / 2;

    const padX = 14 * scale;
    const padY = 8 * scale;
    const badgeX = drawX - padX;
    const badgeY = drawY - padY;
    const badgeW = drawW + padX * 2;
    const badgeH = drawH + padY * 2;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10 * scale;

    if (style === "emerald") {
      const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      grad.addColorStop(0, "rgba(4, 38, 28, 0.98)");
      grad.addColorStop(1, "rgba(2, 24, 18, 0.98)");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "#D4AF37";
    } else if (style === "dark") {
      const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      grad.addColorStop(0, "rgba(22, 18, 12, 0.98)");
      grad.addColorStop(1, "rgba(8, 8, 8, 0.98)");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "#F3E5AB";
    } else if (style === "glass") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.strokeStyle = "#D4AF37";
    } else {
      const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      grad.addColorStop(1, "rgba(254, 243, 199, 0.96)");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "#D4AF37";
    }

    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 14 * scale);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.drawImage(hallmarkImg, drawX, drawY, drawW, drawH);
    ctx.restore();
    ctx.restore();
    return;
  }

  // Pure Vector Fallback if Image is loading
  const w = 210 * scale;
  const h = 68 * scale;
  const left = centerX - w / 2;
  const top = centerY - h / 2;

  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 10 * scale;
  ctx.fillStyle = "rgba(24, 18, 10, 0.96)";
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(left, top, w, h, 14 * scale);
  else ctx.rect(left, top, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // BIS Triangle mark
  const triCenterX = left + 36 * scale;
  const triCenterY = centerY - 1 * scale;
  const triSize = 18 * scale;

  ctx.fillStyle = "#D4AF37";
  ctx.beginPath();
  ctx.moveTo(triCenterX, triCenterY - triSize * 0.95);
  ctx.lineTo(triCenterX + triSize * 0.95, triCenterY + triSize * 0.75);
  ctx.lineTo(triCenterX - triSize * 0.95, triCenterY + triSize * 0.75);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#FFF6D4";
  ctx.font = `bold ${Math.round(28 * scale)}px Georgia, serif`;
  ctx.textAlign = "left";
  ctx.fillText("916", left + 68 * scale, centerY + 6 * scale);

  ctx.restore();
};

// ==========================================
// 4 DISTINCT ELEGANT FULL-CANVAS TEMPLATE RENDERERS
// ==========================================

/**
 * Helper to parse numeric gold price and calculate 8GM (1 Pavan/Sovereign) price
 */
const getFormattedRates = (livePrices = {}) => {
  const parseNum = (str) => {
    if (!str) return 0;
    const clean = String(str).replace(/[^0-9.]/g, "");
    return parseFloat(clean) || 0;
  };

  const gold1gVal = parseNum(livePrices.gold22k) || 7195;
  const silver1gVal = parseNum(livePrices.silver999) || 94.50;
  const gold8gVal = gold1gVal * 8;

  return {
    gold1gVal,
    silver1gVal,
    gold8gVal,
    gold1gStr: `\u20b9${gold1gVal.toLocaleString("en-IN")}`,
    gold8gStr: `\u20b9${gold8gVal.toLocaleString("en-IN")}`,
    silver1gStr: `\u20b9${silver1gVal.toLocaleString("en-IN")}`,
  };
};

/** Draw a rounded rectangle helper */
const roundRect = (ctx, x, y, w, h, r) => {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
};

/** Draw decorative horizontal rule with diamond in center */
const drawOrnamentalRule = (ctx, x, y, w, color, scale) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2 * scale;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.44, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.56, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  // Center Diamond Accents
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  const ds = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - ds);
  ctx.lineTo(x + w / 2 + ds, y);
  ctx.lineTo(x + w / 2, y + ds);
  ctx.lineTo(x + w / 2 - ds, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/**
 * Helper to wrap and draw physical showroom address text on canvas (Clean, no emoji injection)
 */
const drawShowroomAddress = (ctx, addressText, startX, startY, maxWidth, lineHeight, maxLines = 2) => {
  if (!addressText) return;
  const cleanText = String(addressText).replace(/[\r\n]+/g, ", ").trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  
  const lines = [];
  let currentLine = "";
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        const remainingWords = words.slice(i);
        let lastLine = "";
        for (const remWord of remainingWords) {
          const testLast = lastLine ? `${lastLine} ${remWord}` : remWord;
          if (ctx.measureText(testLast + "...").width > maxWidth) {
            lastLine = lastLine ? `${lastLine}...` : `${remWord.slice(0, 15)}...`;
            break;
          }
          lastLine = testLast;
        }
        lines.push(lastLine || currentLine);
        currentLine = "";
        break;
      }
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, startX, startY + index * lineHeight);
  });
};

// ==============================
// TEMPLATE 1: Royal Heritage (Maroon & Gold)
// ==============================
const drawTemplate1_RoyalHeritage = (ctx, W, H, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const sx = W / 1080, sy = H / 1920, sc = Math.min(sx, sy);
  const cx = W / 2;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const rates = getFormattedRates(livePrices);
  const phone = shopInfo?.phonePrimary || shopInfo?.phone || "+91 99520 54493";
  const address = shopInfo?.address || shopInfo?.city || "Tuticorin";

  // Light base overlay allowing product image to shine through
  ctx.fillStyle = "rgba(12, 2, 6, 0.18)";
  ctx.fillRect(0, 0, W, H);

  // TOP HEADER: Soft Glassmorphic Gradient Scrim
  const topScrim = ctx.createLinearGradient(0, 0, 0, 240 * sy);
  topScrim.addColorStop(0, "rgba(22, 4, 10, 0.96)");
  topScrim.addColorStop(0.7, "rgba(22, 4, 10, 0.82)");
  topScrim.addColorStop(1, "rgba(12, 2, 6, 0)");
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, W, 240 * sy);

  // Top Edge Gold Bar
  const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
  goldGrad.addColorStop(0, "rgba(212,175,55,0.2)"); goldGrad.addColorStop(0.5, "#D4AF37"); goldGrad.addColorStop(1, "rgba(212,175,55,0.2)");
  ctx.fillStyle = goldGrad; ctx.fillRect(0, 0, W, 6 * sy);

  // --- HEADER: TOP-LEFT LOGO MEDALLION, SHOP NAME, TOP-RIGHT DATE ---
  const logoRadius = 48 * sc;
  const logoCenterX = 55 * sx + logoRadius; // ~ 103 * sx
  const logoCenterY = 40 * sy + logoRadius; // ~ 88 * sy
  drawShopLogoBadge(ctx, logoCenterX, logoCenterY, logoRadius, shopLogoImg, shopName, sc);

  const textStartX = logoCenterX + logoRadius + 20 * sx;
  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(212,175,55,0.6)"; ctx.shadowBlur = 14 * sc;
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(44 * sc)}px Georgia, serif`;
  ctx.fillText(shopName, textStartX, logoCenterY - 4 * sy); ctx.shadowBlur = 0;

  ctx.fillStyle = "#D4AF37"; ctx.font = `bold ${Math.round(16 * sc)}px Arial, sans-serif`;
  ctx.fillText("SOLITAIRE & FINE JEWELLERY", textStartX, logoCenterY + 28 * sy);
  ctx.restore();

  // Top Right Date
  ctx.save();
  ctx.textAlign = "right";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8 * sc;
  ctx.fillStyle = "#FDE68A"; ctx.font = `bold ${Math.round(24 * sc)}px Georgia, serif`;
  ctx.fillText(dateStr, W - 50 * sx, logoCenterY + 4 * sy);
  ctx.restore();

  drawOrnamentalRule(ctx, 40 * sx, 195 * sy, W - 80 * sx, "#D4AF37", sc);

  // === SIDE-BY-SIDE RATE CARDS (GOLD LEFT & SILVER RIGHT) AT Y = 1240px ===
  const cardY = 1240 * sy, cardH = 260 * sy, cardW = 480 * sx;
  const leftX = 40 * sx, leftCx = leftX + cardW / 2;
  const rightX = 560 * sx, rightCx = rightX + cardW / 2;

  // LEFT CARD: GOLD 22K (1g)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 18 * sc;
  const gPanel = ctx.createLinearGradient(leftX, cardY, leftX, cardY + cardH);
  gPanel.addColorStop(0, "rgba(45, 10, 8, 0.94)"); gPanel.addColorStop(1, "rgba(20, 4, 4, 0.96)");
  ctx.fillStyle = gPanel; ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 2.2 * sc;
  ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(19 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 22K GOLD RATE", leftCx, cardY + 40 * sy);
  ctx.fillStyle = "#D4AF37"; ctx.font = `bold ${Math.round(14 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", leftCx, cardY + 66 * sy);

  drawOrnamentalRule(ctx, leftX + 40 * sx, cardY + 90 * sy, cardW - 80 * sx, "rgba(212,175,55,0.45)", sc);

  ctx.shadowColor = "rgba(212,175,55,0.7)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(64 * sc)}px Georgia, serif`;
  ctx.fillText(rates.gold1gStr, leftCx, cardY + 186 * sy); ctx.shadowBlur = 0;

  // RIGHT CARD: SILVER 999 (1g)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 18 * sc;
  const sPanel = ctx.createLinearGradient(rightX, cardY, rightX, cardY + cardH);
  sPanel.addColorStop(0, "rgba(20, 24, 34, 0.94)"); sPanel.addColorStop(1, "rgba(10, 12, 18, 0.96)");
  ctx.fillStyle = sPanel; ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2.2 * sc;
  ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#CBD5E1"; ctx.font = `bold ${Math.round(19 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 999 FINE SILVER", rightCx, cardY + 40 * sy);
  ctx.fillStyle = "#94A3B8"; ctx.font = `bold ${Math.round(14 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", rightCx, cardY + 66 * sy);

  drawOrnamentalRule(ctx, rightX + 40 * sx, cardY + 90 * sy, cardW - 80 * sx, "rgba(203,213,225,0.45)", sc);

  ctx.shadowColor = "rgba(226,232,240,0.7)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(64 * sc)}px Georgia, serif`;
  ctx.fillText(rates.silver1gStr, rightCx, cardY + 186 * sy); ctx.shadowBlur = 0;

  // === FOOTER: SEAMLESS VIGNETTE SCRIM, ENLARGED HIGH-CONTRAST PHONE & ADDRESS ===
  const fY = 1530 * sy;
  const fGrad = ctx.createLinearGradient(0, fY, 0, H);
  fGrad.addColorStop(0, "rgba(12, 2, 6, 0)");
  fGrad.addColorStop(0.2, "rgba(20, 4, 8, 0.88)");
  fGrad.addColorStop(1, "rgba(10, 1, 3, 0.98)");
  ctx.fillStyle = fGrad; ctx.fillRect(0, fY, W, H - fY);

  drawOrnamentalRule(ctx, 40 * sx, fY + 30 * sy, W - 80 * sx, "#D4AF37", sc);

  // Phone Vector Icon Badge & Text
  const iconR = 20 * sc;
  const phoneX = 60 * sx + iconR;
  const phoneY = fY + 85 * sy;
  drawVectorIconBadge(ctx, phoneX, phoneY, iconR, "phone", sc, "#FFE566");

  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(255, 229, 102, 0.7)"; ctx.shadowBlur = 14 * sc;
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(36 * sc)}px Arial, sans-serif`;
  ctx.fillText(phone, phoneX + iconR + 16 * sx, phoneY + 12 * sy);
  ctx.restore();

  // Showroom Address Vector Icon Badge & Text
  const pinX = 60 * sx + iconR;
  const pinY = phoneY + 56 * sy;
  drawVectorIconBadge(ctx, pinX, pinY, iconR, "pin", sc, "#D4AF37");

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(24 * sc)}px Arial, sans-serif`;
  drawShowroomAddress(ctx, address, pinX + iconR + 16 * sx, pinY + 8 * sy, W - 440 * sx, 32 * sy, 2);
  ctx.restore();

  // Right Bottom: BIS 916 Hallmark Badge
  drawRealBIS916Hallmark(ctx, W - 150 * sx, fY + 115 * sy, sc * 0.82, "gold", hallmarkImg);

  // Bottom Center: Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,229,128,0.9)"; ctx.font = `italic ${Math.round(22 * sc)}px Georgia, serif`;
  ctx.fillText('"Where Luxury Meets Tradition"', cx, H - 30 * sy);

  ctx.fillStyle = goldGrad; ctx.fillRect(0, H - 6 * sy, W, 6 * sy);
  ctx.restore();
};

// ==============================
// TEMPLATE 2: Midnight Navy & Diamond
// ==============================
const drawTemplate2_ModernMinimalist = (ctx, W, H, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const sx = W / 1080, sy = H / 1920, sc = Math.min(sx, sy);
  const cx = W / 2;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const rates = getFormattedRates(livePrices);
  const phone = shopInfo?.phonePrimary || shopInfo?.phone || "+91 99520 54493";
  const address = shopInfo?.address || shopInfo?.city || "Tuticorin";

  ctx.fillStyle = "rgba(2, 6, 20, 0.18)";
  ctx.fillRect(0, 0, W, H);

  // TOP HEADER: Soft Scrim Gradient
  const topScrim2 = ctx.createLinearGradient(0, 0, 0, 240 * sy);
  topScrim2.addColorStop(0, "rgba(4, 18, 64, 0.96)");
  topScrim2.addColorStop(0.7, "rgba(4, 18, 64, 0.82)");
  topScrim2.addColorStop(1, "rgba(2, 6, 20, 0)");
  ctx.fillStyle = topScrim2;
  ctx.fillRect(0, 0, W, 240 * sy);

  // Silver top line
  const slvGrad = ctx.createLinearGradient(0, 0, W, 0);
  slvGrad.addColorStop(0, "rgba(180,200,255,0)"); slvGrad.addColorStop(0.5, "rgba(220,235,255,0.9)"); slvGrad.addColorStop(1, "rgba(180,200,255,0)");
  ctx.fillStyle = slvGrad; ctx.fillRect(0, 0, W, 6 * sy);

  // --- HEADER: TOP-LEFT LOGO MEDALLION, SHOP NAME, TOP-RIGHT DATE ---
  const logoRadius = 48 * sc;
  const logoCenterX = 55 * sx + logoRadius;
  const logoCenterY = 40 * sy + logoRadius;
  drawShopLogoBadge(ctx, logoCenterX, logoCenterY, logoRadius, shopLogoImg, shopName, sc);

  const textStartX = logoCenterX + logoRadius + 20 * sx;
  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(126,184,255,0.6)"; ctx.shadowBlur = 14 * sc;
  ctx.fillStyle = "#FFFFFF"; ctx.font = `bold ${Math.round(44 * sc)}px Georgia, serif`;
  ctx.fillText(shopName, textStartX, logoCenterY - 4 * sy); ctx.shadowBlur = 0;

  ctx.fillStyle = "#7EB8FF"; ctx.font = `bold ${Math.round(16 * sc)}px Arial, sans-serif`;
  ctx.fillText("BOUTIQUE FINE JEWELLERY", textStartX, logoCenterY + 28 * sy);
  ctx.restore();

  // Top Right Date
  ctx.save();
  ctx.textAlign = "right";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8 * sc;
  ctx.fillStyle = "#A5CFFF"; ctx.font = `bold ${Math.round(24 * sc)}px Georgia, serif`;
  ctx.fillText(dateStr, W - 50 * sx, logoCenterY + 4 * sy);
  ctx.restore();

  const acLine = ctx.createLinearGradient(40 * sx, 0, W - 40 * sx, 0);
  acLine.addColorStop(0, "rgba(126,184,255,0)"); acLine.addColorStop(0.5, "rgba(200,225,255,0.85)"); acLine.addColorStop(1, "rgba(126,184,255,0)");
  ctx.strokeStyle = acLine; ctx.lineWidth = 1.2 * sc;
  ctx.beginPath(); ctx.moveTo(40 * sx, 195 * sy); ctx.lineTo(W - 40 * sx, 195 * sy); ctx.stroke();

  // === SIDE-BY-SIDE RATE CARDS AT Y = 1240px ===
  const cardY = 1240 * sy, cardH = 260 * sy, cardW = 480 * sx;
  const leftX = 40 * sx, leftCx = leftX + cardW / 2;
  const rightX = 560 * sx, rightCx = rightX + cardW / 2;

  // LEFT CARD: GOLD 22K
  ctx.save();
  ctx.shadowColor = "rgba(0,100,255,0.3)"; ctx.shadowBlur = 18 * sc;
  const gPanel2 = ctx.createLinearGradient(leftX, cardY, leftX, cardY + cardH);
  gPanel2.addColorStop(0, "rgba(6, 25, 80, 0.94)"); gPanel2.addColorStop(1, "rgba(3, 12, 45, 0.96)");
  ctx.fillStyle = gPanel2; ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#7EB8FF"; ctx.lineWidth = 2.2 * sc;
  ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#7EB8FF"; ctx.font = `bold ${Math.round(19 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 22K GOLD RATE", leftCx, cardY + 40 * sy);
  ctx.fillStyle = "#A5CFFF"; ctx.font = `bold ${Math.round(14 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", leftCx, cardY + 66 * sy);

  ctx.strokeStyle = acLine; ctx.lineWidth = 1.2 * sc;
  ctx.beginPath(); ctx.moveTo(leftX + 40 * sx, cardY + 90 * sy); ctx.lineTo(leftX + cardW - 40 * sx, cardY + 90 * sy); ctx.stroke();

  ctx.shadowColor = "rgba(126,184,255,0.8)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#FFFFFF"; ctx.font = `bold ${Math.round(64 * sc)}px Georgia, serif`;
  ctx.fillText(rates.gold1gStr, leftCx, cardY + 186 * sy); ctx.shadowBlur = 0;

  // RIGHT CARD: SILVER 999
  ctx.save();
  ctx.shadowColor = "rgba(0,100,255,0.3)"; ctx.shadowBlur = 18 * sc;
  const sPanel2 = ctx.createLinearGradient(rightX, cardY, rightX, cardY + cardH);
  sPanel2.addColorStop(0, "rgba(10, 30, 70, 0.94)"); sPanel2.addColorStop(1, "rgba(5, 15, 40, 0.96)");
  ctx.fillStyle = sPanel2; ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2.2 * sc;
  ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#CBD5E1"; ctx.font = `bold ${Math.round(19 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 999 FINE SILVER", rightCx, cardY + 40 * sy);
  ctx.fillStyle = "#94A3B8"; ctx.font = `bold ${Math.round(14 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", rightCx, cardY + 66 * sy);

  ctx.strokeStyle = acLine; ctx.lineWidth = 1.2 * sc;
  ctx.beginPath(); ctx.moveTo(rightX + 40 * sx, cardY + 90 * sy); ctx.lineTo(rightX + cardW - 40 * sx, cardY + 90 * sy); ctx.stroke();

  ctx.shadowColor = "rgba(226,232,240,0.7)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(64 * sc)}px Georgia, serif`;
  ctx.fillText(rates.silver1gStr, rightCx, cardY + 186 * sy); ctx.shadowBlur = 0;

  // === FOOTER: SEAMLESS VIGNETTE SCRIM, ENLARGED HIGH-CONTRAST PHONE & ADDRESS ===
  const fY = 1530 * sy;
  const fGrad2 = ctx.createLinearGradient(0, fY, 0, H);
  fGrad2.addColorStop(0, "rgba(2, 6, 20, 0)");
  fGrad2.addColorStop(0.2, "rgba(4, 16, 50, 0.88)");
  fGrad2.addColorStop(1, "rgba(2, 8, 30, 0.98)");
  ctx.fillStyle = fGrad2; ctx.fillRect(0, fY, W, H - fY);

  ctx.strokeStyle = acLine; ctx.lineWidth = 1.2 * sc;
  ctx.beginPath(); ctx.moveTo(40 * sx, fY + 30 * sy); ctx.lineTo(W - 40 * sx, fY + 30 * sy); ctx.stroke();

  // Phone Vector Icon Badge & Text
  const iconR = 20 * sc;
  const phoneX2 = 60 * sx + iconR;
  const phoneY2 = fY + 85 * sy;
  drawVectorIconBadge(ctx, phoneX2, phoneY2, iconR, "phone", sc, "#7EB8FF");

  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(126, 184, 255, 0.75)"; ctx.shadowBlur = 14 * sc;
  ctx.fillStyle = "#7EB8FF"; ctx.font = `bold ${Math.round(36 * sc)}px Arial, sans-serif`;
  ctx.fillText(phone, phoneX2 + iconR + 16 * sx, phoneY2 + 12 * sy);
  ctx.restore();

  // Showroom Address Vector Icon Badge & Text
  const pinX2 = 60 * sx + iconR;
  const pinY2 = phoneY2 + 56 * sy;
  drawVectorIconBadge(ctx, pinX2, pinY2, iconR, "pin", sc, "#7EB8FF");

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(24 * sc)}px Arial, sans-serif`;
  drawShowroomAddress(ctx, address, pinX2 + iconR + 16 * sx, pinY2 + 8 * sy, W - 440 * sx, 32 * sy, 2);
  ctx.restore();

  // Right Bottom: BIS 916 Hallmark Badge
  drawRealBIS916Hallmark(ctx, W - 150 * sx, fY + 115 * sy, sc * 0.82, "glass", hallmarkImg);

  // Bottom Center: Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(165,207,255,0.85)"; ctx.font = `italic ${Math.round(22 * sc)}px Georgia, serif`;
  ctx.fillText('"Excellence in Every Carat"', cx, H - 30 * sy);

  ctx.fillStyle = slvGrad; ctx.fillRect(0, H - 6 * sy, W, 6 * sy);
  ctx.restore();
};

// ==============================
// TEMPLATE 3: Forest Emerald & Traditional Gold
// ==============================
const drawTemplate3_BridalEmerald = (ctx, W, H, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const sx = W / 1080, sy = H / 1920, sc = Math.min(sx, sy);
  const cx = W / 2;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const rates = getFormattedRates(livePrices);
  const phone = shopInfo?.phonePrimary || shopInfo?.phone || "+91 99520 54493";
  const address = shopInfo?.address || shopInfo?.city || "Tuticorin";

  ctx.fillStyle = "rgba(0, 10, 5, 0.18)";
  ctx.fillRect(0, 0, W, H);

  // TOP HEADER: Soft Emerald Scrim
  const topScrim3 = ctx.createLinearGradient(0, 0, 0, 240 * sy);
  topScrim3.addColorStop(0, "rgba(1, 35, 15, 0.96)");
  topScrim3.addColorStop(0.7, "rgba(1, 35, 15, 0.82)");
  topScrim3.addColorStop(1, "rgba(0, 10, 5, 0)");
  ctx.fillStyle = topScrim3;
  ctx.fillRect(0, 0, W, 240 * sy);

  // Gold top line
  const topGoldGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGoldGrad.addColorStop(0, "rgba(212,175,55,0.2)"); topGoldGrad.addColorStop(0.5, "#D4AF37"); topGoldGrad.addColorStop(1, "rgba(212,175,55,0.2)");
  ctx.fillStyle = topGoldGrad; ctx.fillRect(0, 0, W, 6 * sy);

  // --- HEADER: TOP-LEFT LOGO MEDALLION, SHOP NAME, TOP-RIGHT DATE ---
  const logoRadius = 48 * sc;
  const logoCenterX = 55 * sx + logoRadius;
  const logoCenterY = 40 * sy + logoRadius;
  drawShopLogoBadge(ctx, logoCenterX, logoCenterY, logoRadius, shopLogoImg, shopName, sc);

  const textStartX = logoCenterX + logoRadius + 20 * sx;
  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(212,175,55,0.6)"; ctx.shadowBlur = 14 * sc;
  ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(44 * sc)}px Georgia, serif`;
  ctx.fillText(shopName, textStartX, logoCenterY - 4 * sy); ctx.shadowBlur = 0;

  ctx.fillStyle = "#6EE7B7"; ctx.font = `bold ${Math.round(16 * sc)}px Arial, sans-serif`;
  ctx.fillText("BRIDAL & TRADITIONAL JEWELLERY", textStartX, logoCenterY + 28 * sy);
  ctx.restore();

  // Top Right Date
  ctx.save();
  ctx.textAlign = "right";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8 * sc;
  ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(24 * sc)}px Georgia, serif`;
  ctx.fillText(dateStr, W - 50 * sx, logoCenterY + 4 * sy);
  ctx.restore();

  drawOrnamentalRule(ctx, 40 * sx, 195 * sy, W - 80 * sx, "#D4AF37", sc);

  // === SIDE-BY-SIDE RATE CARDS AT Y = 1240px ===
  const cardY = 1240 * sy, cardH = 260 * sy, cardW = 480 * sx;
  const leftX = 40 * sx, leftCx = leftX + cardW / 2;
  const rightX = 560 * sx, rightCx = rightX + cardW / 2;

  // LEFT CARD: GOLD 22K
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 18 * sc;
  const gPanel3 = ctx.createLinearGradient(leftX, cardY, leftX, cardY + cardH);
  gPanel3.addColorStop(0, "rgba(0, 35, 15, 0.94)"); gPanel3.addColorStop(1, "rgba(0, 18, 8, 0.96)");
  ctx.fillStyle = gPanel3; ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 2.2 * sc;
  ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(19 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 22K GOLD RATE", leftCx, cardY + 40 * sy);
  ctx.fillStyle = "#6EE7B7"; ctx.font = `bold ${Math.round(14 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", leftCx, cardY + 66 * sy);

  drawOrnamentalRule(ctx, leftX + 40 * sx, cardY + 90 * sy, cardW - 80 * sx, "rgba(212,175,55,0.45)", sc);

  ctx.shadowColor = "rgba(212,175,55,0.7)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(64 * sc)}px Georgia, serif`;
  ctx.fillText(rates.gold1gStr, leftCx, cardY + 186 * sy); ctx.shadowBlur = 0;

  // RIGHT CARD: SILVER 999
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 18 * sc;
  const sPanel3 = ctx.createLinearGradient(rightX, cardY, rightX, cardY + cardH);
  sPanel3.addColorStop(0, "rgba(5, 25, 20, 0.94)"); sPanel3.addColorStop(1, "rgba(2, 12, 10, 0.96)");
  ctx.fillStyle = sPanel3; ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2.2 * sc;
  ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#CBD5E1"; ctx.font = `bold ${Math.round(19 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 999 FINE SILVER", rightCx, cardY + 40 * sy);
  ctx.fillStyle = "#94A3B8"; ctx.font = `bold ${Math.round(14 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", rightCx, cardY + 66 * sy);

  drawOrnamentalRule(ctx, rightX + 40 * sx, cardY + 90 * sy, cardW - 80 * sx, "rgba(203,213,225,0.45)", sc);

  ctx.shadowColor = "rgba(226,232,240,0.7)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(64 * sc)}px Georgia, serif`;
  ctx.fillText(rates.silver1gStr, rightCx, cardY + 186 * sy); ctx.shadowBlur = 0;

  // === FOOTER: SEAMLESS VIGNETTE SCRIM, ENLARGED HIGH-CONTRAST PHONE & ADDRESS ===
  const fY = 1530 * sy;
  const fGrad3 = ctx.createLinearGradient(0, fY, 0, H);
  fGrad3.addColorStop(0, "rgba(0, 10, 5, 0)");
  fGrad3.addColorStop(0.2, "rgba(0, 24, 12, 0.88)");
  fGrad3.addColorStop(1, "rgba(0, 10, 5, 0.98)");
  ctx.fillStyle = fGrad3; ctx.fillRect(0, fY, W, H - fY);

  drawOrnamentalRule(ctx, 40 * sx, fY + 30 * sy, W - 80 * sx, "#D4AF37", sc);

  // Phone Vector Icon Badge & Text
  const iconR = 20 * sc;
  const phoneX3 = 60 * sx + iconR;
  const phoneY3 = fY + 85 * sy;
  drawVectorIconBadge(ctx, phoneX3, phoneY3, iconR, "phone", sc, "#FFDA6A");

  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(255, 218, 106, 0.75)"; ctx.shadowBlur = 14 * sc;
  ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(36 * sc)}px Arial, sans-serif`;
  ctx.fillText(phone, phoneX3 + iconR + 16 * sx, phoneY3 + 12 * sy);
  ctx.restore();

  // Showroom Address Vector Icon Badge & Text
  const pinX3 = 60 * sx + iconR;
  const pinY3 = phoneY3 + 56 * sy;
  drawVectorIconBadge(ctx, pinX3, pinY3, iconR, "pin", sc, "#D4AF37");

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(24 * sc)}px Arial, sans-serif`;
  drawShowroomAddress(ctx, address, pinX3 + iconR + 16 * sx, pinY3 + 8 * sy, W - 440 * sx, 32 * sy, 2);
  ctx.restore();

  // Right Bottom: BIS 916 Hallmark Badge
  drawRealBIS916Hallmark(ctx, W - 150 * sx, fY + 115 * sy, sc * 0.82, "emerald", hallmarkImg);

  // Bottom Center: Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(200,255,210,0.85)"; ctx.font = `italic ${Math.round(22 * sc)}px Georgia, serif`;
  ctx.fillText('"Your Heritage, Our Craft"', cx, H - 30 * sy);

  ctx.fillStyle = topGoldGrad; ctx.fillRect(0, H - 6 * sy, W, 6 * sy);
  ctx.restore();
};

// ==============================
// TEMPLATE 4: Champagne & Rose Gold
// ==============================
const drawTemplate4_SolitaireDark = (ctx, W, H, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const sx = W / 1080, sy = H / 1920, sc = Math.min(sx, sy);
  const cx = W / 2;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const rates = getFormattedRates(livePrices);
  const phone = shopInfo?.phonePrimary || shopInfo?.phone || "+91 99520 54493";
  const address = shopInfo?.address || shopInfo?.city || "Tuticorin";

  ctx.fillStyle = "rgba(15, 8, 4, 0.18)";
  ctx.fillRect(0, 0, W, H);

  // TOP HEADER: Soft Rose Gold Scrim
  const topScrim4 = ctx.createLinearGradient(0, 0, 0, 240 * sy);
  topScrim4.addColorStop(0, "rgba(35, 18, 6, 0.96)");
  topScrim4.addColorStop(0.7, "rgba(35, 18, 6, 0.82)");
  topScrim4.addColorStop(1, "rgba(15, 8, 4, 0)");
  ctx.fillStyle = topScrim4;
  ctx.fillRect(0, 0, W, 240 * sy);

  // Rose gold side stripes
  const lsW = 12 * sx;
  const lsGrad = ctx.createLinearGradient(0, 0, lsW, 0);
  lsGrad.addColorStop(0, "#A06040"); lsGrad.addColorStop(1, "#D4916A");
  ctx.fillStyle = lsGrad; ctx.fillRect(0, 0, lsW, H);
  const rsGrad = ctx.createLinearGradient(W - lsW, 0, W, 0);
  rsGrad.addColorStop(0, "#D4916A"); rsGrad.addColorStop(1, "#A06040");
  ctx.fillStyle = rsGrad; ctx.fillRect(W - lsW, 0, lsW, H);

  const roseBar = ctx.createLinearGradient(0, 0, W, 0);
  roseBar.addColorStop(0, "rgba(212,145,106,0.3)"); roseBar.addColorStop(0.5, "rgba(212,145,106,0.9)"); roseBar.addColorStop(1, "rgba(212,145,106,0.3)");
  ctx.fillStyle = roseBar; ctx.fillRect(lsW, 0, W - lsW * 2, 6 * sy);

  // --- HEADER: TOP-LEFT LOGO MEDALLION, SHOP NAME, TOP-RIGHT DATE ---
  const logoRadius = 48 * sc;
  const logoCenterX = 55 * sx + logoRadius;
  const logoCenterY = 40 * sy + logoRadius;
  drawShopLogoBadge(ctx, logoCenterX, logoCenterY, logoRadius, shopLogoImg, shopName, sc);

  const textStartX = logoCenterX + logoRadius + 20 * sx;
  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(212,145,106,0.55)"; ctx.shadowBlur = 14 * sc;
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(44 * sc)}px Georgia, serif`;
  ctx.fillText(shopName, textStartX, logoCenterY - 4 * sy); ctx.shadowBlur = 0;

  ctx.fillStyle = "#D4916A"; ctx.font = `bold ${Math.round(16 * sc)}px Arial, sans-serif`;
  ctx.fillText("SOLITAIRE & FINE JEWELLERY", textStartX, logoCenterY + 28 * sy);
  ctx.restore();

  // Top Right Date
  ctx.save();
  ctx.textAlign = "right";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8 * sc;
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(24 * sc)}px Georgia, serif`;
  ctx.fillText(dateStr, W - 50 * sx, logoCenterY + 4 * sy);
  ctx.restore();

  drawOrnamentalRule(ctx, 40 * sx, 195 * sy, W - 80 * sx, "#D4916A", sc);

  // === SIDE-BY-SIDE RATE CARDS AT Y = 1240px ===
  const cardY = 1240 * sy, cardH = 260 * sy, cardW = 480 * sx;
  const leftX = 40 * sx, leftCx = leftX + cardW / 2;
  const rightX = 560 * sx, rightCx = rightX + cardW / 2;

  // LEFT CARD: GOLD 22K
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 18 * sc;
  const gPanel4 = ctx.createLinearGradient(leftX, cardY, leftX, cardY + cardH);
  gPanel4.addColorStop(0, "rgba(35, 18, 6, 0.94)"); gPanel4.addColorStop(1, "rgba(18, 8, 3, 0.96)");
  ctx.fillStyle = gPanel4; ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#D4916A"; ctx.lineWidth = 2.2 * sc;
  ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#D4916A"; ctx.font = `bold ${Math.round(19 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 22K GOLD RATE", leftCx, cardY + 40 * sy);
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(14 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", leftCx, cardY + 66 * sy);

  drawOrnamentalRule(ctx, leftX + 40 * sx, cardY + 90 * sy, cardW - 80 * sx, "rgba(212,145,106,0.45)", sc);

  ctx.shadowColor = "rgba(212,145,106,0.7)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(64 * sc)}px Georgia, serif`;
  ctx.fillText(rates.gold1gStr, leftCx, cardY + 186 * sy); ctx.shadowBlur = 0;

  // RIGHT CARD: SILVER 999
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.65)"; ctx.shadowBlur = 18 * sc;
  const sPanel4 = ctx.createLinearGradient(rightX, cardY, rightX, cardY + cardH);
  sPanel4.addColorStop(0, "rgba(20, 14, 10, 0.94)"); sPanel4.addColorStop(1, "rgba(8, 6, 4, 0.96)");
  ctx.fillStyle = sPanel4; ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2.2 * sc;
  ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#CBD5E1"; ctx.font = `bold ${Math.round(19 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 999 FINE SILVER", rightCx, cardY + 40 * sy);
  ctx.fillStyle = "#94A3B8"; ctx.font = `bold ${Math.round(14 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", rightCx, cardY + 66 * sy);

  drawOrnamentalRule(ctx, rightX + 40 * sx, cardY + 90 * sy, cardW - 80 * sx, "rgba(203,213,225,0.45)", sc);

  ctx.shadowColor = "rgba(226,232,240,0.7)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(64 * sc)}px Georgia, serif`;
  ctx.fillText(rates.silver1gStr, rightCx, cardY + 186 * sy); ctx.shadowBlur = 0;

  // === FOOTER: SEAMLESS VIGNETTE SCRIM, ENLARGED HIGH-CONTRAST PHONE & ADDRESS ===
  const fY = 1530 * sy;
  const fGrad4 = ctx.createLinearGradient(0, fY, 0, H);
  fGrad4.addColorStop(0, "rgba(15, 8, 4, 0)");
  fGrad4.addColorStop(0.2, "rgba(24, 12, 5, 0.88)");
  fGrad4.addColorStop(1, "rgba(12, 6, 2, 0.98)");
  ctx.fillStyle = fGrad4; ctx.fillRect(0, fY, W, H - fY);

  drawOrnamentalRule(ctx, 40 * sx, fY + 30 * sy, W - 80 * sx, "#C08050", sc);

  // Phone Vector Icon Badge & Text
  const iconR = 20 * sc;
  const phoneX4 = 60 * sx + iconR;
  const phoneY4 = fY + 85 * sy;
  drawVectorIconBadge(ctx, phoneX4, phoneY4, iconR, "phone", sc, "#F5E4C8");

  ctx.save();
  ctx.textAlign = "left";
  ctx.shadowColor = "rgba(245, 228, 200, 0.75)"; ctx.shadowBlur = 14 * sc;
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(36 * sc)}px Arial, sans-serif`;
  ctx.fillText(phone, phoneX4 + iconR + 16 * sx, phoneY4 + 12 * sy);
  ctx.restore();

  // Showroom Address Vector Icon Badge & Text
  const pinX4 = 60 * sx + iconR;
  const pinY4 = phoneY4 + 56 * sy;
  drawVectorIconBadge(ctx, pinX4, pinY4, iconR, "pin", sc, "#D4916A");

  ctx.save();
  ctx.textAlign = "left";
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(24 * sc)}px Arial, sans-serif`;
  drawShowroomAddress(ctx, address, pinX4 + iconR + 16 * sx, pinY4 + 8 * sy, W - 440 * sx, 32 * sy, 2);
  ctx.restore();

  // Right Bottom: BIS 916 Hallmark Badge
  drawRealBIS916Hallmark(ctx, W - 150 * sx, fY + 115 * sy, sc * 0.82, "gold", hallmarkImg);

  // Bottom Center: Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(245,228,200,0.85)"; ctx.font = `italic ${Math.round(22 * sc)}px Georgia, serif`;
  ctx.fillText('"Where Luxury Meets Tradition"', cx, H - 30 * sy);

  ctx.fillStyle = roseBar; ctx.fillRect(lsW, H - 6 * sy, W - lsW * 2, 6 * sy);
  ctx.restore();
};

/**
 * Dispatcher function for drawing the selected overlay template
 */
const drawStatusOverlay = (ctx, canvasWidth, canvasHeight, shopName, templateId = 1, shopLogoImg = null, livePrices = {}, shopInfo = {}, hallmarkImg = null) => {
  switch (Number(templateId)) {
    case 1:
      drawTemplate1_RoyalHeritage(ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg);
      break;
    case 2:
      drawTemplate2_ModernMinimalist(ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg);
      break;
    case 3:
      drawTemplate3_BridalEmerald(ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg);
      break;
    case 4:
      drawTemplate4_SolitaireDark(ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg);
      break;
    default:
      drawTemplate1_RoyalHeritage(ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg);
      break;
  }
};

// ==========================================
function ImageCanvasPreview({ imageUrl, shopName, templateId, drawOverlay, shopLogoImg, livePrices, shopInfo, hallmarkImg }) {
  const canvasRef = React.useRef(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    let isSubscribed = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    const render = async () => {
      let bgImg = null;
      if (imageUrl) {
        bgImg = await loadSingleImage(imageUrl);
      }
      if (!isSubscribed) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
        const canvasAspect = canvas.width / canvas.height;
        let drawW, drawH, drawX, drawY;
        if (imgAspect > canvasAspect) {
          drawH = canvas.height;
          drawW = drawH * imgAspect;
          drawX = (canvas.width - drawW) / 2;
          drawY = 0;
        } else {
          drawW = canvas.width;
          drawH = drawW / imgAspect;
          drawX = 0;
          drawY = (canvas.height - drawH) / 2;
        }
        try {
          ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
        } catch (err) {
          console.warn("Canvas image draw exception caught:", err);
        }
      } else {
        const fallbackGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        fallbackGrad.addColorStop(0, "#1A0008");
        fallbackGrad.addColorStop(0.5, "#2D000F");
        fallbackGrad.addColorStop(1, "#0D0006");
        ctx.fillStyle = fallbackGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      drawOverlay(ctx, canvas.width, canvas.height, shopName, templateId, shopLogoImg, livePrices, shopInfo, hallmarkImg);
      setIsLoaded(true);
    };

    render();

    return () => {
      isSubscribed = false;
    };
  }, [imageUrl, shopName, templateId, drawOverlay, shopLogoImg, livePrices, shopInfo, hallmarkImg]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-stone-900 flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      {!isLoaded && (
        <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
          <span className="text-xs text-amber-200/90 font-medium">Generating HD Card...</span>
        </div>
      )}
    </div>
  );
}

function VideoCanvasPreview({ videoUrl, shopName, templateId, drawOverlay, shopLogoImg, livePrices, shopInfo, hallmarkImg }) {
  const canvasRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    let videoBlobUrl = null;
    const video = document.createElement("video");
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const fullUrl = resolveFullImageUrl(videoUrl);
    fetch(fullUrl)
      .then((res) => res.blob())
      .then((blob) => {
        videoBlobUrl = URL.createObjectURL(blob);
        if (isMounted) {
          video.src = videoBlobUrl;
        }
      })
      .catch(() => {
        if (isMounted) {
          video.crossOrigin = "anonymous";
          video.src = fullUrl;
        }
      });

    let animId;
    let lastRenderTime = 0;
    const fpsInterval = 1000 / 30; // Throttle to 30 FPS for mobile smoothness & RAM efficiency

    const startAnimation = () => {
      const canvas = canvasRef.current;
      if (!canvas || !isMounted) return;

      // Optimally sized preview canvas resolution for mobile preview
      canvas.width = 540;
      canvas.height = 960;
      const ctx = canvas.getContext("2d");

      video.play().catch(() => {});

      const render = (currentTime) => {
        if (!isMounted) return;
        animId = requestAnimationFrame(render);

        const delta = currentTime - lastRenderTime;
        if (delta > fpsInterval) {
          lastRenderTime = currentTime - (delta % fpsInterval);
          if (ctx && canvas && video.readyState >= 2) {
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              drawOverlay(ctx, canvas.width, canvas.height, shopName, templateId, shopLogoImg, livePrices, shopInfo, hallmarkImg);
            } catch (err) {
              console.warn("Video canvas render warning:", err);
            }
          }
        }
      };
      animId = requestAnimationFrame(render);
    };

    video.onloadeddata = startAnimation;

    return () => {
      isMounted = false;
      if (animId) cancelAnimationFrame(animId);
      if (video) {
        video.pause();
        video.onloadeddata = null;
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [videoUrl, shopName, templateId, drawOverlay, shopLogoImg, livePrices, shopInfo, hallmarkImg]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="relative w-full h-full cursor-pointer overflow-hidden rounded-2xl" onClick={togglePlay}>
      <canvas ref={canvasRef} className="w-full h-full object-cover" />
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-stone-950 flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}

class StatusSectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("WhatsAppStatusSection Error Boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section id="status" className="py-16 bg-[#FAF9F5] text-stone-800 border-t border-stone-200 text-center">
          <div className="max-w-xl mx-auto p-8 bg-white border border-[#D4AF37]/40 rounded-3xl shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#B8860B] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">WhatsApp Status & Media Studio</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Media rendering control refreshed safely. Click below to reload the studio.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2.5 bg-stone-950 text-[#D4AF37] font-bold text-xs rounded-xl hover:bg-stone-800 transition-colors shadow-md"
            >
              Reload Studio
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// MAIN SECTION COMPONENT
// ==========================================

function WhatsAppStatusSectionInner({ shopInfo }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [successInfo, setSuccessInfo] = useState(null);
  const [loadedShopLogo, setLoadedShopLogo] = useState(null);
  const [loadedHallmarkLogo, setLoadedHallmarkLogo] = useState(null);

  const [basicAssets, setBasicAssets] = useState({
    images: [],
    videos: [
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam1.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam2.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam3.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam4.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam5.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam6.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam7.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam8.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam9.mp4',
      'https://s3.in-west3.purestore.io/aadagam/images/aadagam10.mp4',
    ]
  });

  const [livePrices, setLivePrices] = useState({
    gold22k: "\u20b97,195",
    silver999: "\u20b994.50",
  });

  // Preload Official Golden BIS 916 Hallmark Logo Image
  useEffect(() => {
    loadSingleImage("/bis_916_hallmark.png").then((img) => {
      if (img) setLoadedHallmarkLogo(img);
    });
  }, []);

  // Preload Shop Logo Image whenever shopInfo.logo changes or localStorage updates
  useEffect(() => {
    const activeSubdomain = getTenantSubdomain();
    const shopPrefix = getShopPrefix(activeSubdomain);
    let cachedLogo = "";
    try {
      const c1 = localStorage.getItem(`aadagam_contact_info_${shopPrefix}`);
      const c2 = localStorage.getItem(`aadagam_site_info_${shopPrefix}`);
      const parsed1 = c1 ? JSON.parse(c1) : null;
      const parsed2 = c2 ? JSON.parse(c2) : null;
      cachedLogo =
        parsed1?.logo ||
        parsed1?.logoUrl ||
        parsed2?.logo ||
        parsed2?.logoUrl ||
        parsed2?.siteInfoData?.logo ||
        parsed2?.siteInfoData?.logoUrl ||
        "";
    } catch (e) {}

    const rawLogoUrl = shopInfo?.logo || shopInfo?.logoUrl || cachedLogo;
    loadLogoWithFallback(rawLogoUrl).then((loadedImg) => {
      if (loadedImg) setLoadedShopLogo(loadedImg);
    });
  }, [shopInfo?.logo, shopInfo?.logoUrl, shopInfo]);

  useEffect(() => {
    async function loadData() {
      try {
        const [siteRes, assetsRes] = await Promise.all([
          getSiteInfo(),
          getBasicAssets(),
        ]);

        if (siteRes && siteRes.success === 1) {
          if (Array.isArray(siteRes.priceData)) {
            let goldVal = "\u20b97,195";
            let silverVal = "\u20b994.50";
            siteRes.priceData.forEach((item) => {
              const mat = (item.material || "").toLowerCase();
              const purity = (item.purity || "").toLowerCase();
              const price = Number(item.price);
              if (!isNaN(price) && price > 0) {
                if (mat === "gold" && purity.includes("22")) {
                  goldVal = `\u20b9${price.toLocaleString("en-IN")}`;
                }
                if (mat === "silver" && (purity.includes("24") || purity.includes("925"))) {
                  silverVal = `\u20b9${price.toLocaleString("en-IN")}`;
                }
              }
            });
            setLivePrices({ gold22k: goldVal, silver999: silverVal });
          }

          // Extract shop logo directly from API siteInfoData response
          const apiLogo = siteRes.siteInfoData?.logo || siteRes.siteInfoData?.logoUrl;
          loadLogoWithFallback(apiLogo || shopInfo?.logo || cachedLogo).then((img) => {
            if (img) setLoadedShopLogo(img);
          });
        }

        if (assetsRes && assetsRes.status === 1) {
          setBasicAssets({
            images: assetsRes.image?.data || [],
            videos: assetsRes.video?.data || [],
          });
        }
      } catch (err) {
        console.warn("Error loading WhatsApp status assets/prices:", err);
      }
    }
    loadData();
  }, []);

  const statusButtons = [
    {
      id: 1,
      label: "Royal Maroon & Gold",
      desc: "Deep Burgundy, Filigree Mandala",
      theme: {
        bg: "bg-gradient-to-br from-[#6B0014] via-[#950020] to-[#3D0010] hover:from-[#950020] hover:to-[#6B0014]",
        border: "border-[#D4AF37]/60 hover:border-[#FFFFFF]",
        shadow: "shadow-lg shadow-amber-950/40 hover:shadow-xl hover:shadow-amber-900/60",
        iconWrapper: "bg-red-950/80 border border-[#D4AF37]/50 text-[#FEF08A]",
        titleColor: "text-white font-serif",
        actionColor: "text-[#FEF08A] group-hover:text-white",
        accentDot: "bg-[#D4AF37]",
      },
    },
    {
      id: 2,
      label: "Midnight Navy & Diamond",
      desc: "Deep Blue, Geometric Diamond Grid",
      theme: {
        bg: "bg-gradient-to-br from-[#06174A] via-[#0A2568] to-[#020D30] hover:from-[#0A2568] hover:to-[#06174A]",
        border: "border-blue-400/50 hover:border-blue-100",
        shadow: "shadow-lg shadow-blue-950/40 hover:shadow-xl hover:shadow-blue-900/60",
        iconWrapper: "bg-blue-950/80 border border-blue-400/40 text-blue-200",
        titleColor: "text-white font-serif",
        actionColor: "text-blue-200 group-hover:text-white",
        accentDot: "bg-blue-300",
      },
    },
    {
      id: 3,
      label: "Forest Emerald Traditional",
      desc: "Deep Green, Lotus Floral Pattern",
      theme: {
        bg: "bg-gradient-to-br from-[#013018] via-[#024E28] to-[#000D06] hover:from-[#024E28] hover:to-[#013018]",
        border: "border-emerald-400/50 hover:border-[#D4AF37]",
        shadow: "shadow-lg shadow-emerald-950/40 hover:shadow-xl hover:shadow-emerald-900/60",
        iconWrapper: "bg-emerald-950/80 border border-emerald-400/40 text-emerald-200",
        titleColor: "text-white font-serif",
        actionColor: "text-emerald-200 group-hover:text-white",
        accentDot: "bg-emerald-300",
      },
    },
    {
      id: 4,
      label: "Champagne Rose Gold",
      desc: "Warm Brown, Editorial Layout",
      theme: {
        bg: "bg-gradient-to-br from-[#2E1A0A] via-[#3D2210] to-[#1A0D05] hover:from-[#3D2210] hover:to-[#2E1A0A]",
        border: "border-[#D4916A]/50 hover:border-amber-300",
        shadow: "shadow-lg shadow-amber-950/40 hover:shadow-xl hover:shadow-amber-900/60",
        iconWrapper: "bg-amber-950/80 border border-[#D4916A]/40 text-[#D4916A]",
        titleColor: "text-white font-serif",
        actionColor: "text-[#D4916A] group-hover:text-white",
        accentDot: "bg-[#D4916A]",
      },
    },
  ];


  const statusVideos = [
    {
      id: 1,
      label: "Royal Heritage Reel",
      desc: "Regal Gold Frame Reel",
      theme: {
        bg: "bg-gradient-to-br from-[#881337] via-[#BE123C] to-[#4C0519] hover:from-[#BE123C] hover:to-[#881337]",
        border: "border-rose-400/60 hover:border-white",
        shadow: "shadow-lg shadow-rose-950/40 hover:shadow-xl hover:shadow-rose-900/60",
        iconWrapper: "bg-rose-950/80 border border-rose-400/50 text-rose-200",
        titleColor: "text-white font-serif",
        actionColor: "text-rose-200 group-hover:text-white",
        accentDot: "bg-rose-300",
      },
    },
    {
      id: 2,
      label: "Minimalist Glass Reel",
      desc: "Frosted Glass Reel",
      theme: {
        bg: "bg-gradient-to-br from-[#0E7490] via-[#0891B2] to-[#155E75] hover:from-[#0891B2] hover:to-[#0E7490]",
        border: "border-cyan-300/60 hover:border-white",
        shadow: "shadow-lg shadow-cyan-950/40 hover:shadow-xl hover:shadow-cyan-900/60",
        iconWrapper: "bg-cyan-950/80 border border-cyan-300/40 text-cyan-200",
        titleColor: "text-white font-serif",
        actionColor: "text-cyan-100 group-hover:text-white",
        accentDot: "bg-cyan-200",
      },
    },
  ];

  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  /**
   * Generates a high-resolution 1080x1920 9:16 Status Card PNG using binary Blob URLs
   */
  const generateImageCardBlobUrl = (label, cardNum, templateId = 1, bgImageUrl = null) => {
    return new Promise(async (resolve) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) return resolve(null);

        const activeSubdomain = getTenantSubdomain();
        const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase();
        const shopPrefix = getShopPrefix(activeSubdomain);
        const shopNameStr = (shopInfo?.name || defaultShopName).toUpperCase();

        let cachedLogo = "";
        try {
          const c1 = localStorage.getItem(`aadagam_contact_info_${shopPrefix}`);
          const c2 = localStorage.getItem(`aadagam_site_info_${shopPrefix}`);
          const parsed1 = c1 ? JSON.parse(c1) : null;
          const parsed2 = c2 ? JSON.parse(c2) : null;
          cachedLogo =
            parsed1?.logo ||
            parsed1?.logoUrl ||
            parsed2?.logo ||
            parsed2?.logoUrl ||
            parsed2?.siteInfoData?.logo ||
            parsed2?.siteInfoData?.logoUrl ||
            "";
        } catch (e) {}

        const targetShopLogoUrl = shopInfo?.logo || shopInfo?.logoUrl || cachedLogo;
        let activeShopLogo = loadedShopLogo || null;
        if (!activeShopLogo) {
          activeShopLogo = await loadLogoWithFallback(targetShopLogoUrl);
        }

        let activeHallmarkLogo = loadedHallmarkLogo || null;
        if (!activeHallmarkLogo) {
          activeHallmarkLogo = await loadSingleImage("/bis_916_hallmark.png");
        }

        if (bgImageUrl) {
          const bgImg = await loadSingleImage(bgImageUrl);
          if (bgImg && bgImg.complete && bgImg.naturalWidth > 0 && bgImg.isCorsClean !== false) {
            const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
            const canvasAspect = canvas.width / canvas.height;
            let drawW, drawH, drawX, drawY;
            if (imgAspect > canvasAspect) {
              drawH = canvas.height;
              drawW = drawH * imgAspect;
              drawX = (canvas.width - drawW) / 2;
              drawY = 0;
            } else {
              drawW = canvas.width;
              drawH = drawW / imgAspect;
              drawX = 0;
              drawY = (canvas.height - drawH) / 2;
            }
            try {
              ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
            } catch (err) {
              console.warn("Background image draw exception:", err);
            }
          } else {
            const fallbackGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            fallbackGrad.addColorStop(0, "#1A0008");
            fallbackGrad.addColorStop(0.5, "#2D000F");
            fallbackGrad.addColorStop(1, "#0D0006");
            ctx.fillStyle = fallbackGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        } else {
          const fallbackGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          fallbackGrad.addColorStop(0, "#1A0008");
          fallbackGrad.addColorStop(0.5, "#2D000F");
          fallbackGrad.addColorStop(1, "#0D0006");
          ctx.fillStyle = fallbackGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        drawStatusOverlay(ctx, canvas.width, canvas.height, shopNameStr, templateId, activeShopLogo, livePrices, shopInfo, activeHallmarkLogo);

        const exportCanvas = () => {
          return new Promise((resExp) => {
            try {
              if (canvas.toBlob) {
                canvas.toBlob((blob) => {
                  if (blob) {
                    resExp(URL.createObjectURL(blob));
                  } else {
                    try {
                      resExp(canvas.toDataURL("image/png"));
                    } catch (e) {
                      resExp(null);
                    }
                  }
                }, "image/png");
              } else {
                resExp(canvas.toDataURL("image/png"));
              }
            } catch (e) {
              resExp(null);
            }
          });
        };

        let resultUrl = await exportCanvas();

        if (resultUrl) {
          resolve({ blobUrl: resultUrl, shopName: shopNameStr, cardNum });
        } else {
          resolve(null);
        }
      } catch (e) {
        console.warn("Canvas blob error:", e);
        resolve(null);
      }
    });
  };

  const handleOpenImagePreview = (btn) => {
    const activeSubdomain = getTenantSubdomain();
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase();
    const shopName = (shopInfo?.name || defaultShopName).toUpperCase();

    let selectedAssetUrl = "";
    if (basicAssets.images && basicAssets.images.length > 0) {
      const randIdx = Math.floor(Math.random() * basicAssets.images.length);
      const imgObj = basicAssets.images[randIdx];
      selectedAssetUrl = typeof imgObj === "string" ? imgObj : (imgObj?.url || imgObj?.image || imgObj?.src || "");
    }
    const randomImageNumber = Math.floor(Math.random() * 30) + 1;
    const finalImgUrl = selectedAssetUrl || `/aadagam (${randomImageNumber}).png`;

    setPreviewData({
      type: "image",
      title: btn.label,
      subtitle: `Daily Rates Card - Template ${btn.id}`,
      previewUrl: finalImgUrl,
      cardNum: randomImageNumber,
      templateId: btn.id,
      shopName: shopName,
      item: btn,
    });
  };

  const handleOpenVideoPreview = (vid) => {
    const activeSubdomain = getTenantSubdomain();
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase();
    const shopName = (shopInfo?.name || defaultShopName).toUpperCase();

    let selectedVideoUrl = "";
    if (basicAssets.videos && basicAssets.videos.length > 0) {
      const randIdx = Math.floor(Math.random() * basicAssets.videos.length);
      const vidObj = basicAssets.videos[randIdx];
      selectedVideoUrl = typeof vidObj === "string" ? vidObj : (vidObj?.url || vidObj?.video || vidObj?.src || "");
    }
    const randomVideoNumber = Math.floor(Math.random() * 10) + 1;
    const fallbackFile = `aadagam${randomVideoNumber}.mp4`;
    const finalVidUrl = selectedVideoUrl || `/status_videos/${fallbackFile}`;

    setPreviewData({
      type: "video",
      title: vid.label,
      subtitle: `WhatsApp Status Reel - Template ${vid.id}`,
      previewUrl: finalVidUrl,
      fileName: fallbackFile,
      videoNumber: randomVideoNumber,
      templateId: vid.id,
      shopName: shopName,
      item: vid,
    });
  };

  const triggerImageDownloadFromBlobUrl = (blobUrl, label, cardNum, templateId = 1) => {
    const activeSubdomain = getTenantSubdomain();
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase();
    const shopName = (shopInfo?.name || defaultShopName).toUpperCase();
    const cleanName = shopName.toLowerCase().replace(/\s+/g, "_");

    const link = document.createElement("a");
    link.download = `${cleanName}_template${templateId}_${label.toLowerCase().replace(/\s+/g, "_")}_card_${cardNum}.png`;
    link.href = blobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (blobUrl && blobUrl.startsWith("blob:")) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
    }

    setSuccessInfo({
      title: `${label} Downloaded Successfully!`,
      desc: `Template #${templateId} Card for ${shopName} saved with Live Rates & Official Gold BIS 916 Hallmark!`,
      type: "image",
    });

    setTimeout(() => {
      setSuccessInfo((prev) => (prev?.title?.startsWith(label) ? null : prev));
    }, 5000);
  };

  const handleVideoDownloadItem = async (videoNumber, label, fileName, templateId = 1) => {
    setDownloadingId(`video-${videoNumber}`);
    setDownloadProgress(2);
    setSuccessInfo(null);

    const activeSubdomain = getTenantSubdomain();
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase();
    const shopNameStr = (shopInfo?.name || defaultShopName).toUpperCase();
    const cleanName = shopNameStr.toLowerCase().replace(/\s+/g, "_");

    const videoPath = previewData?.previewUrl || `/status_videos/${fileName || `aadagam${videoNumber}.mp4`}`;
    const fullVideoUrl = resolveFullImageUrl(videoPath);

    try {
      // 1. Preload Shop Logo & Hallmark Logo
      const shopPrefix = getShopPrefix(activeSubdomain);
      let cachedLogo = "";
      try {
        const c1 = localStorage.getItem(`aadagam_contact_info_${shopPrefix}`);
        const c2 = localStorage.getItem(`aadagam_site_info_${shopPrefix}`);
        const parsed1 = c1 ? JSON.parse(c1) : null;
        const parsed2 = c2 ? JSON.parse(c2) : null;
        cachedLogo =
          parsed1?.logo ||
          parsed1?.logoUrl ||
          parsed2?.logo ||
          parsed2?.logoUrl ||
          parsed2?.siteInfoData?.logo ||
          parsed2?.siteInfoData?.logoUrl ||
          "";
      } catch (e) {}

      const targetShopLogoUrl = shopInfo?.logo || shopInfo?.logoUrl || cachedLogo;
      let activeShopLogo = loadedShopLogo || null;
      if (!activeShopLogo) {
        activeShopLogo = await loadLogoWithFallback(targetShopLogoUrl);
      }
      let activeHallmarkLogo = loadedHallmarkLogo || null;
      if (!activeHallmarkLogo) {
        activeHallmarkLogo = await loadSingleImage("/bis_916_hallmark.png");
      }

      setDownloadProgress(10);

      // 2. Setup Video Element with local Blob URL fetching to guarantee no canvas tainting
      const video = document.createElement("video");
      video.muted = false;
      video.volume = 1.0;
      video.playsInline = true;

      let videoBlobUrl = null;
      try {
        const vRes = await fetch(fullVideoUrl);
        if (vRes.ok) {
          const vBlob = await vRes.blob();
          videoBlobUrl = URL.createObjectURL(vBlob);
        }
      } catch (e) {
        console.warn("Could not fetch video as blob, using direct URL:", e);
      }

      const targetVideoSrc = videoBlobUrl || fullVideoUrl;

      const loadVideoWithFallback = (url) => {
        return new Promise((resolve) => {
          let hasAttemptedFallback = false;
          if (!url.startsWith("blob:")) {
            video.crossOrigin = "anonymous";
          }
          video.src = url;

          const handleLoaded = () => resolve(true);
          const handleError = () => {
            if (!hasAttemptedFallback && !url.startsWith("blob:")) {
              hasAttemptedFallback = true;
              video.removeAttribute("crossOrigin");
              video.src = url;
              video.load();
            } else {
              resolve(false);
            }
          };

          video.onloadeddata = handleLoaded;
          video.onerror = handleError;
        });
      };

      await loadVideoWithFallback(targetVideoSrc);

      setDownloadProgress(20);

      // 3. Create Canvas for Branded Overlay Rendering
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;
      const ctx = canvas.getContext("2d");

      if (!ctx || !canvas.captureStream || typeof MediaRecorder === "undefined") {
        throw new Error("MediaRecorder streaming not supported on this browser");
      }

      const videoLogoOverlay = activeShopLogo || null;

      // Draw initial frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      drawStatusOverlay(ctx, canvas.width, canvas.height, shopNameStr, templateId, videoLogoOverlay, livePrices, shopInfo, activeHallmarkLogo);

      const canvasStream = canvas.captureStream(30);
      const compositeStream = new MediaStream();

      // Add visual track from canvas
      const canvasVideoTrack = canvasStream.getVideoTracks()[0];
      if (canvasVideoTrack) {
        compositeStream.addTrack(canvasVideoTrack);
      }

      // Route Audio using Web Audio API Destination Node
      let audioCtx = null;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          if (audioCtx.state === "suspended") {
            await audioCtx.resume();
          }
          const source = audioCtx.createMediaElementSource(video);
          const audioDest = audioCtx.createMediaStreamDestination();
          source.connect(audioDest);

          if (audioDest.stream && audioDest.stream.getAudioTracks().length > 0) {
            audioDest.stream.getAudioTracks().forEach((track) => compositeStream.addTrack(track));
          }
        }
      } catch (audioErr) {
        console.warn("Could not route silent audio stream:", audioErr);
      }

      // Determine Best Supported MIME Type & Matching File Extension
      let mimeType = "video/webm";
      let ext = "webm";

      if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.42E01E,mp4a.40.2")) {
        mimeType = "video/mp4;codecs=avc1.42E01E,mp4a.40.2";
        ext = "mp4";
      } else if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
        mimeType = "video/mp4;codecs=avc1";
        ext = "mp4";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
        ext = "mp4";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
        mimeType = "video/webm;codecs=vp9,opus";
        ext = "webm";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        mimeType = "video/webm;codecs=vp8,opus";
        ext = "webm";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm";
        ext = "webm";
      }

      const recorderOptions = { mimeType };
      if (MediaRecorder.isTypeSupported(mimeType)) {
        recorderOptions.videoBitsPerSecond = 3500000;
      }

      const mediaRecorder = new MediaRecorder(compositeStream, recorderOptions);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const recordPromise = new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${cleanName}_template${templateId}_branded_whatsapp_reel_${videoNumber}.${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 3000);
          resolve();
        };
      });

      mediaRecorder.start();
      await video.play();

      let animId;
      const duration = video.duration || 10;

      const renderFrame = () => {
        if (video.paused || video.ended) {
          cancelAnimationFrame(animId);
          setDownloadProgress(100);
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
          return;
        }

        const pct = Math.min(99, Math.round((video.currentTime / duration) * 100));
        setDownloadProgress(pct);

        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          drawStatusOverlay(ctx, canvas.width, canvas.height, shopNameStr, templateId, videoLogoOverlay, livePrices, shopInfo, activeHallmarkLogo);
        } catch (e) {
          console.warn("Canvas overlay render frame error:", e);
        }
        animId = requestAnimationFrame(renderFrame);
      };

      renderFrame();
      await recordPromise;

      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }

      setDownloadingId(null);
      setDownloadProgress(0);
      setSuccessInfo({
        title: `${label || `Status Video ${videoNumber}`} Branded & Saved!`,
        desc: `Custom Template #${templateId} Video for ${shopNameStr} branded with Live Rates, Logo & Showroom Emblem!`,
        type: "video",
      });
    } catch (err) {
      console.warn("Video branding fallback to direct MP4 download:", err);
      setDownloadProgress(90);
      try {
        const response = await fetch(fullVideoUrl, { mode: "cors" });
        if (!response.ok) throw new Error("Fetch failed");
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${cleanName}_template${templateId}_whatsapp_status_video_${videoNumber}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 3000);
      } catch (e) {
        const link = document.createElement("a");
        link.href = fullVideoUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = `${cleanName}_template${templateId}_whatsapp_status_video_${videoNumber}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadingId(null);
      setDownloadProgress(0);
      setSuccessInfo({
        title: `${label || `Status Video ${videoNumber}`} Downloaded!`,
        desc: `WhatsApp Status Video #${videoNumber} (${label}) saved successfully!`,
        type: "video",
      });
    }

    setTimeout(() => {
      setSuccessInfo((prev) => (prev?.title?.includes(`Status Video ${videoNumber}`) ? null : prev));
    }, 5000);
  };

  const handleVideoDownload = () => {
    const randomIdx = Math.floor(Math.random() * statusVideos.length);
    const target = statusVideos[randomIdx] || statusVideos[0];
    handleOpenVideoPreview(target);
  };

  return (
    <section id="status" className="py-16 sm:py-20 bg-gradient-to-b from-[#FAF9F5] via-stone-100/60 to-[#FAF9F5] text-stone-800 border-t border-stone-200 relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-[#D4AF37]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#25D366]/15 text-emerald-800 border border-[#25D366]/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Status & Media Studio</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Luxury Branded Templates for Status & Reels
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
            Choose from 4 elegant image templates and 2 video reel templates stamped with live gold & silver rates, official BIS 916 Hallmark logo, and your showroom emblem.
          </p>
        </div>

        {/* Action Container Card */}
        <div className="bg-white border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-xl max-w-4xl mx-auto space-y-8 relative">
          {/* Row 1: 4 Status Image Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest text-left">
                Image Status Templates (Live Rates & Official BIS 916 Hallmark)
              </span>
              <span className="text-[10px] font-mono text-[#B8860B] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
                4 Unique Luxury Templates
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {statusButtons.map((btn) => {
                const isLoading = isPreviewLoading && previewData === null;
                const { theme } = btn;
                return (
                  <button
                    key={btn.id}
                    onClick={() => handleOpenImagePreview(btn)}
                    disabled={isPreviewLoading}
                    className={`group relative flex flex-col items-center justify-center gap-2.5 sm:gap-3 ${theme.bg} border ${theme.border} ${theme.shadow} p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:-translate-y-1.5 disabled:opacity-60 cursor-pointer overflow-hidden text-center`}
                  >
                    <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${theme.accentDot} opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all`} />

                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${theme.iconWrapper} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300 shadow-sm`}>
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-current" />
                      ) : (
                        <Image className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className={`font-serif font-bold text-xs sm:text-sm tracking-wide block truncate ${theme.titleColor}`}>
                        {btn.label}
                      </span>
                      <span className="text-[10px] text-stone-400 font-light block truncate">
                        Template {btn.id}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold font-mono transition-colors ${theme.actionColor}`}>
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>Preview Card</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase tracking-wider font-bold text-stone-400 absolute">
              HD Video Status Templates (2 Reel Styles)
            </span>
          </div>

          {/* Row 2: 2 Status Video Templates */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
              {statusVideos.map((vid) => {
                const { theme } = vid;
                return (
                  <button
                    key={vid.id}
                    onClick={() => handleOpenVideoPreview(vid)}
                    className={`group relative flex flex-col items-center justify-center gap-2.5 sm:gap-3 ${theme.bg} border ${theme.border} ${theme.shadow} p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden text-center`}
                  >
                    <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${theme.accentDot} opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all`} />

                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${theme.iconWrapper} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300 shadow-sm`}>
                      <Video className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5">
                      <span className={`font-serif font-bold text-xs sm:text-sm tracking-wide block truncate ${theme.titleColor}`}>
                        {vid.label}
                      </span>
                      <span className="text-[10px] text-stone-300/80 font-light block truncate">
                        Template {vid.id}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold font-mono transition-colors ${theme.actionColor}`}>
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>Preview Reel</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action: Preview & Download Video & Festive Announcement */}
          <div className="pt-2 flex flex-col items-center justify-center gap-5">
            <button
              onClick={handleVideoDownload}
              className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold py-3.5 px-8 rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-900/15 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-200" />
              <span>Preview & Download Branded Video Reel</span>
            </button>

            {/* Grand, Styled & Catchy Festival Posters Announcement Button */}
            <div className="w-full sm:w-auto">
              <div className="relative group inline-flex items-center justify-center w-full sm:w-auto">
                {/* Ambient Festive Luxury Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-[#F59E0B] to-yellow-400 rounded-3xl blur-md opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse" />

                {/* Grand Announcement Container */}
                <div className="relative w-full sm:w-auto inline-flex items-center justify-center gap-3.5 sm:gap-5 bg-gradient-to-r from-[#1C1205] via-[#331C04] to-[#1C1205] text-[#FAF9F5] border-2 border-[#FDE047] py-3.5 sm:py-4 px-6 sm:px-10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden cursor-default select-none">
                  {/* Subtle Shimmer Ray */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                  {/* Left Blinking Ball & Sparkles Icon */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F59E0B]"></span>
                    </span>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-stone-950 flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-stone-950" />
                    </div>
                  </div>

                  {/* Catchy Announcement Content (Prominent & Bold) */}
                  <div className="text-center px-1 sm:px-2">
                    <span className="font-serif font-bold text-base sm:text-lg md:text-xl tracking-wider text-white drop-shadow-sm block">
                      Festival Posters are coming soon
                    </span>
                  </div>

                  {/* Right Blinking Ball & Sparkles Icon */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-stone-950 flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-stone-950" />
                    </div>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F59E0B]"></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Alert Toast */}
          {successInfo && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/80 rounded-2xl p-4 text-left flex items-start justify-between gap-3 shadow-md animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                    {successInfo.title}
                  </h4>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {successInfo.desc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuccessInfo(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors shrink-0"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW MODAL PANEL */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-950 border border-[#D4AF37]/40 rounded-3xl max-w-3xl w-full text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setPreviewData(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: 9:16 Smartphone Preview Frame */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
              <div className="relative aspect-[9/16] w-full max-w-[280px] sm:max-w-[300px] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/60 bg-stone-900 group">
                {previewData.type === "image" ? (
                  <ImageCanvasPreview
                    imageUrl={previewData.previewUrl}
                    shopName={previewData.shopName}
                    templateId={previewData.templateId || 1}
                    drawOverlay={drawStatusOverlay}
                    shopLogoImg={loadedShopLogo}
                    livePrices={livePrices}
                    shopInfo={shopInfo}
                    hallmarkImg={loadedHallmarkLogo}
                  />
                ) : (
                  <VideoCanvasPreview
                    videoUrl={previewData.previewUrl}
                    shopName={previewData.shopName}
                    templateId={previewData.templateId || 1}
                    drawOverlay={drawStatusOverlay}
                    shopLogoImg={loadedShopLogo}
                    livePrices={livePrices}
                    shopInfo={shopInfo}
                    hallmarkImg={loadedHallmarkLogo}
                  />
                )}
              </div>
              <span className="text-[11px] text-stone-400 font-mono mt-2">
                9:16 HD WhatsApp Status Format (Template #{previewData.templateId || 1})
              </span>
            </div>

            {/* Right: Info & Download Actions */}
            <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Template {previewData.templateId || 1} Preview</span>
                </div>

                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {previewData.title}
                  </h3>
                  <p className="text-xs text-stone-400 font-light mt-1">
                    {previewData.subtitle}
                  </p>
                </div>

                {/* Rates & Branding Badge Box */}
                <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
                    <span className="text-stone-400">Showroom Name:</span>
                    <span className="font-bold text-[#D4AF37]">{previewData.shopName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
                    <span className="text-stone-400">Shop Logo:</span>
                    <span className="font-bold text-emerald-400">{loadedShopLogo ? "Loaded (Custom)" : "Default Luxury Emblem"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
                    <span className="text-stone-400">Live Gold Rate (22K):</span>
                    <span className="font-number font-bold text-amber-300 text-sm">{livePrices.gold22k} /g</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
                    <span className="text-stone-400">Live Silver Rate (999):</span>
                    <span className="font-number font-bold text-stone-200 text-sm">{livePrices.silver999} /g</span>
                  </div>
                  <div className="flex items-start justify-between text-xs pt-0.5 gap-2">
                    <span className="text-stone-400 shrink-0">Showroom Address:</span>
                    <span className="font-medium text-stone-300 text-right truncate max-w-[200px]">
                      {shopInfo?.address || shopInfo?.city || "Tuticorin"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                  Stamped with official 100% BIS Hallmarked 916 gold emblem, live metal rates in Cinzel typography, showroom logo, contact phone number, and physical showroom address.
                </p>
              </div>

              {/* Download & Close Actions */}
              <div className="space-y-3 pt-2">
                {previewData.type === "image" ? (
                  <button
                    onClick={async () => {
                      const res = await generateImageCardBlobUrl(previewData.title, previewData.cardNum, previewData.templateId, previewData.previewUrl);
                      if (res?.blobUrl) {
                        triggerImageDownloadFromBlobUrl(res.blobUrl, previewData.title, previewData.cardNum, previewData.templateId);
                      }
                      setPreviewData(null);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-stone-950 font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-stone-950" />
                    <span>Download Template #{previewData.templateId} Image</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleVideoDownloadItem(previewData.videoNumber, previewData.title, previewData.fileName, previewData.templateId);
                    }}
                    disabled={downloadingId !== null}
                    className="w-full relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-900/20 hover:scale-[1.01] transition-all disabled:opacity-90 cursor-pointer"
                  >
                    {downloadingId ? (
                      <>
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-emerald-500/40 transition-all duration-200"
                          style={{ width: `${downloadProgress}%` }}
                        />
                        <div className="relative z-10 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                          <span>Downloading... {downloadProgress}%</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-emerald-200" />
                        <span>Download Template #{previewData.templateId} Video (Branded Reel)</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setPreviewData(null)}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function WhatsAppStatusSection(props) {
  return (
    <StatusSectionErrorBoundary>
      <WhatsAppStatusSectionInner {...props} />
    </StatusSectionErrorBoundary>
  );
}
