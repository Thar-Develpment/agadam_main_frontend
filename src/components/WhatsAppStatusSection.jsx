import React, { useState, useEffect } from "react";
import { Download, Sparkles, Video, Image, CheckCircle2, Loader2, X, Play } from "lucide-react";
import { getSiteInfo, getBasicAssets } from "../services/api";
import { getTenantSubdomain, getShopPrefix, resolveFullImageUrl } from "../services/apiClient";

// ==========================================
// CANVAS VECTOR EMBLEM & OVERLAY DRAWING HELPERS
// ==========================================

/**
 * Draws the Shop Logo inside a circular badge or fallback luxury shop monogram emblem on Canvas
 */
const drawShopLogoBadge = (ctx, centerX, centerY, radius, shopLogoImg, shopName, scale = 1) => {
  ctx.save();
  
  if (shopLogoImg && shopLogoImg.complete && shopLogoImg.naturalWidth > 0) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 8 * scale;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 3 * scale, 0, Math.PI * 2);
    ctx.clip();
    
    const aspect = shopLogoImg.naturalWidth / shopLogoImg.naturalHeight;
    let drawW = radius * 1.65;
    let drawH = drawW / aspect;
    if (drawH > radius * 1.65) {
      drawH = radius * 1.65;
      drawW = drawH * aspect;
    }
    ctx.drawImage(shopLogoImg, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
    ctx.restore();

    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 3.5 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Luxury Shop Monogram Emblem Medallion (Fallback when shop image logo is not set)
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 10 * scale;

    // Outer Gold Medallion Gradient
    const goldGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    goldGrad.addColorStop(0, "#78590F");
    goldGrad.addColorStop(0.5, "#D4AF37");
    goldGrad.addColorStop(1, "#FFF6D4");
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner Obsidian Background
    const innerGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    innerGrad.addColorStop(0, "#261B02");
    innerGrad.addColorStop(1, "#0D0801");
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FDE68A";
    ctx.lineWidth = 1.8 * scale;
    ctx.stroke();

    // Shop Initial Monogram Letter
    const shopInitial = (shopName || "S").trim().charAt(0).toUpperCase();
    ctx.fillStyle = "#FDE68A";
    ctx.font = `bold ${Math.round(radius * 1.05)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(shopInitial, centerX, centerY + 2 * scale);
  }
  
  ctx.restore();
};

const loadSingleImage = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const fullUrl = resolveFullImageUrl(url);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = fullUrl;
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback preloading without crossOrigin in case CORS header is missing
      const imgNoCors = new window.Image();
      imgNoCors.src = fullUrl;
      imgNoCors.onload = () => resolve(imgNoCors);
      imgNoCors.onerror = () => resolve(null);
    };
  });
};

/**
 * Draws the Authentic, Official Gold BIS 916 Hallmark Logo Image on Canvas
 */
const drawRealBIS916Hallmark = (ctx, centerX, centerY, scale = 1, style = "gold", hallmarkImg = null) => {
  ctx.save();
  
  if (hallmarkImg && hallmarkImg.complete && hallmarkImg.naturalWidth > 0) {
    const aspect = hallmarkImg.naturalWidth / hallmarkImg.naturalHeight;
    const drawW = 230 * scale;
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
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 10 * scale;

    if (style === "emerald") {
      const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      grad.addColorStop(0, "rgba(4, 47, 36, 0.98)");
      grad.addColorStop(1, "rgba(2, 44, 34, 0.98)");
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
      // Luxury Gold Background for the Official 916 Hallmark Logo
      const grad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      grad.addColorStop(1, "rgba(254, 243, 199, 0.96)");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "#D4AF37";
    }

    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16 * scale);
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

  // Vector Fallback if Image is loading
  const w = 220 * scale;
  const h = 72 * scale;
  const left = centerX - w / 2;
  const top = centerY - h / 2;

  ctx.fillStyle = "rgba(26, 22, 16, 0.96)";
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(left, top, w, h, 16 * scale);
  else ctx.rect(left, top, w, h);
  ctx.fill();
  ctx.stroke();

  // BIS Triangle mark
  const triCenterX = left + 40 * scale;
  const triCenterY = centerY - 2 * scale;
  const triSize = 20 * scale;

  ctx.fillStyle = "#D4AF37";
  ctx.beginPath();
  ctx.moveTo(triCenterX, triCenterY - triSize * 0.95);
  ctx.lineTo(triCenterX + triSize * 0.95, triCenterY + triSize * 0.75);
  ctx.lineTo(triCenterX - triSize * 0.95, triCenterY + triSize * 0.75);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `900 ${Math.round(30 * scale)}px Cinzel, serif`;
  ctx.textAlign = "left";
  ctx.fillText("916", left + 72 * scale, centerY + 5 * scale);

  ctx.restore();
};

// ==========================================
// 4 DISTINCT ELEGANT FULL-CANVAS TEMPLATE RENDERERS
// (Each template is fully self-contained, no background image needed)
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
  ctx.lineWidth = 1.5 * scale;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * 0.44, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w * 0.56, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  // Diamond
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  const ds = 5 * scale;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - ds);
  ctx.lineTo(x + w / 2 + ds, y);
  ctx.lineTo(x + w / 2, y + ds);
  ctx.lineTo(x + w / 2 - ds, y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

/** Draw the 3-column rate table */
const drawRatePanel = (ctx, x, y, w, h, rates, bgColor1, bgColor2, borderColor, labelColor, valueColor, dividerColor, scale) => {
  ctx.save();
  const bg = ctx.createLinearGradient(x, y, x, y + h);
  bg.addColorStop(0, bgColor1);
  bg.addColorStop(1, bgColor2);
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 16 * scale;
  ctx.fillStyle = bg;
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 18 * scale);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 18 * scale);
  ctx.stroke();

  const col = w / 3;
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = 1.5 * scale;
  ctx.globalAlpha = 0.4;
  ctx.setLineDash([5 * scale, 5 * scale]);
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + col * i, y + 18 * scale);
    ctx.lineTo(x + col * i, y + h - 18 * scale);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  const cols = [
    { cx: x + col * 0.5, label: "1GM  22K", value: rates.gold1gStr },
    { cx: x + col * 1.5, label: "8GM  22K", value: rates.gold8gStr },
    { cx: x + col * 2.5, label: "1GM SILVER", value: rates.silver1gStr },
  ];

  cols.forEach(({ cx, label, value }) => {
    ctx.textAlign = "center";
    ctx.fillStyle = labelColor;
    ctx.font = `bold ${Math.round(17 * scale)}px Arial, sans-serif`;
    ctx.fillText(label, cx, y + h * 0.28);
    ctx.fillStyle = valueColor;
    ctx.font = `bold ${Math.round(40 * scale)}px Georgia, serif`;
    ctx.fillText(value, cx, y + h * 0.78);
  });

  ctx.restore();
};

// ==============================
// TEMPLATE 1: Royal Maroon & Gold
// ==============================
const drawTemplate1_RoyalHeritage = (ctx, W, H, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const sx = W / 1080, sy = H / 1920, sc = Math.min(sx, sy);
  const cx = W / 2;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  const rates = getFormattedRates(livePrices);
  const phone = shopInfo?.phonePrimary || "+91 99520 54493";
  const city = shopInfo?.city || "Tuticorin";

  // TRANSLUCENT OVERLAY (allows background image/video to be sharp & clear)
  ctx.fillStyle = "rgba(10, 0, 4, 0.20)";
  ctx.fillRect(0, 0, W, H);

  // Top header dark scrim gradient
  const topScrim = ctx.createLinearGradient(0, 0, 0, 410 * sy);
  topScrim.addColorStop(0, "rgba(25, 2, 8, 0.95)");
  topScrim.addColorStop(0.75, "rgba(25, 2, 8, 0.75)");
  topScrim.addColorStop(1, "rgba(10, 0, 4, 0)");
  ctx.fillStyle = topScrim;
  ctx.fillRect(0, 0, W, 410 * sy);

  // Top gold line
  const goldGrad = ctx.createLinearGradient(0, 0, W, 0);
  goldGrad.addColorStop(0, "rgba(212,175,55,0.2)"); goldGrad.addColorStop(0.5, "#D4AF37"); goldGrad.addColorStop(1, "rgba(212,175,55,0.2)");
  ctx.fillStyle = goldGrad; ctx.fillRect(0, 0, W, 7 * sy);

  // Header content
  drawOrnamentalRule(ctx, 55 * sx, 55 * sy, W - 110 * sx, "#D4AF37", sc);
  drawShopLogoBadge(ctx, cx, 120 * sy, 50 * sc, shopLogoImg, shopName, sc);

  ctx.shadowColor = "rgba(212,175,55,0.6)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(58 * sc)}px Georgia, serif`;
  ctx.textAlign = "center"; ctx.fillText(shopName, cx, 215 * sy); ctx.shadowBlur = 0;

  ctx.fillStyle = "#D4AF37"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.fillText("JEWELLERS & DIAMONDS", cx, 250 * sy);

  drawOrnamentalRule(ctx, 55 * sx, 275 * sy, W - 110 * sx, "#D4AF37", sc);

  // BIGGER DATE (No emoji)
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(34 * sc)}px Georgia, serif`;
  ctx.textAlign = "center"; ctx.fillText(dateStr, cx, 325 * sy);

  drawOrnamentalRule(ctx, 70 * sx, 365 * sy, W - 140 * sx, "#D4AF37", sc);

  // === SIDE-BY-SIDE CARDS: GOLD (LEFT) & SILVER (RIGHT) AT BOTTOM (Y = 1240px) ===
  const cardY = 1240 * sy, cardH = 270 * sy, cardW = 480 * sx;
  const leftX = 40 * sx, leftCx = leftX + cardW / 2;
  const rightX = 560 * sx, rightCx = rightX + cardW / 2;

  // LEFT CARD: GOLD 22K (1g only)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 16 * sc;
  const gPanel = ctx.createLinearGradient(leftX, cardY, leftX, cardY + cardH);
  gPanel.addColorStop(0, "rgba(70,15,8,0.92)"); gPanel.addColorStop(1, "rgba(35,4,4,0.95)");
  ctx.fillStyle = gPanel; ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 22K GOLD RATE", leftCx, cardY + 42 * sy);
  ctx.fillStyle = "#D4AF37"; ctx.font = `bold ${Math.round(15 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", leftCx, cardY + 70 * sy);

  drawOrnamentalRule(ctx, leftX + 40 * sx, cardY + 95 * sy, cardW - 80 * sx, "rgba(212,175,55,0.5)", sc);

  ctx.shadowColor = "rgba(212,175,55,0.9)"; ctx.shadowBlur = 24 * sc;
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(72 * sc)}px Georgia, serif`;
  ctx.fillText(rates.gold1gStr, leftCx, cardY + 195 * sy); ctx.shadowBlur = 0;

  // RIGHT CARD: SILVER 999 (1g only)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 16 * sc;
  const sPanel = ctx.createLinearGradient(rightX, cardY, rightX, cardY + cardH);
  sPanel.addColorStop(0, "rgba(25,30,40,0.92)"); sPanel.addColorStop(1, "rgba(12,15,22,0.95)");
  ctx.fillStyle = sPanel; ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#CBD5E1"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 999 FINE SILVER", rightCx, cardY + 42 * sy);
  ctx.fillStyle = "#94A3B8"; ctx.font = `bold ${Math.round(15 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", rightCx, cardY + 70 * sy);

  drawOrnamentalRule(ctx, rightX + 40 * sx, cardY + 95 * sy, cardW - 80 * sx, "rgba(203,213,225,0.5)", sc);

  ctx.shadowColor = "rgba(226,232,240,0.85)"; ctx.shadowBlur = 24 * sc;
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(72 * sc)}px Georgia, serif`;
  ctx.fillText(rates.silver1gStr, rightCx, cardY + 195 * sy); ctx.shadowBlur = 0;

  // === FOOTER (1600px to H) ===
  const fY = 1600 * sy;
  drawOrnamentalRule(ctx, 60 * sx, fY, W - 120 * sx, "#D4AF37", sc);

  const fGrad = ctx.createLinearGradient(0, fY + 10 * sy, 0, H);
  fGrad.addColorStop(0, "rgba(0,0,0,0)"); fGrad.addColorStop(0.2, "rgba(45,5,5,0.95)"); fGrad.addColorStop(1, "rgba(12,1,1,0.99)");
  ctx.fillStyle = fGrad; ctx.fillRect(0, fY + 10 * sy, W, H - (fY + 10 * sy));

  // LEFT BOTTOM: Phone & Place
  const phoneX = 60 * sx;
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(26 * sc)}px Arial, sans-serif`;
  ctx.fillText("\uD83D\uDCDE " + phone, phoneX, fY + 110 * sy);
  ctx.fillStyle = "#E2C97E"; ctx.font = `${Math.round(22 * sc)}px Arial, sans-serif`;
  ctx.fillText("\uD83D\uDCCD " + city, phoneX, fY + 155 * sy);

  // RIGHT BOTTOM: BIS 916 Hallmark Emblem
  if (hallmarkImg && hallmarkImg.complete && hallmarkImg.naturalWidth > 0) {
    drawRealBIS916Hallmark(ctx, W - 160 * sx, fY + 132 * sy, sc * 0.78, "gold", hallmarkImg);
  } else {
    ctx.fillStyle = "#D4AF37"; ctx.font = `bold ${Math.round(18 * sc)}px Arial, sans-serif`;
    ctx.textAlign = "right"; ctx.fillText("BIS 916 HALLMARKED", W - 40 * sx, fY + 132 * sy);
  }

  // BOTTOM CENTER: Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,229,128,0.75)"; ctx.font = `italic ${Math.round(23 * sc)}px Georgia, serif`;
  ctx.fillText('"Where Luxury Meets Tradition"', cx, fY + 250 * sy);

  ctx.fillStyle = goldGrad; ctx.fillRect(0, H - 7 * sy, W, 7 * sy);
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
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  const rates = getFormattedRates(livePrices);
  const phone = shopInfo?.phonePrimary || "+91 99520 54493";
  const city = shopInfo?.city || "Tuticorin";

  // TRANSLUCENT OVERLAY
  ctx.fillStyle = "rgba(2, 6, 20, 0.20)";
  ctx.fillRect(0, 0, W, H);

  // Top header dark scrim gradient
  const topScrim2 = ctx.createLinearGradient(0, 0, 0, 410 * sy);
  topScrim2.addColorStop(0, "rgba(4, 18, 72, 0.95)");
  topScrim2.addColorStop(0.75, "rgba(4, 18, 72, 0.75)");
  topScrim2.addColorStop(1, "rgba(2, 6, 20, 0)");
  ctx.fillStyle = topScrim2;
  ctx.fillRect(0, 0, W, 410 * sy);

  // Silver top line
  const slvGrad = ctx.createLinearGradient(0, 0, W, 0);
  slvGrad.addColorStop(0, "rgba(180,200,255,0)"); slvGrad.addColorStop(0.5, "rgba(220,235,255,0.9)"); slvGrad.addColorStop(1, "rgba(180,200,255,0)");
  ctx.fillStyle = slvGrad; ctx.fillRect(0, 0, W, 6 * sy);

  // Header content
  drawShopLogoBadge(ctx, cx, 110 * sy, 50 * sc, shopLogoImg, shopName, sc);

  ctx.shadowColor = "rgba(100,180,255,0.5)"; ctx.shadowBlur = 22 * sc;
  ctx.fillStyle = "#FFFFFF"; ctx.font = `bold ${Math.round(58 * sc)}px Georgia, serif`;
  ctx.textAlign = "center"; ctx.fillText(shopName, cx, 205 * sy); ctx.shadowBlur = 0;

  ctx.fillStyle = "#7EB8FF"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.fillText("BOUTIQUE FINE JEWELLERY", cx, 240 * sy);

  const acLine = ctx.createLinearGradient(100 * sx, 0, W - 100 * sx, 0);
  acLine.addColorStop(0, "rgba(126,184,255,0)"); acLine.addColorStop(0.5, "rgba(200,225,255,0.85)"); acLine.addColorStop(1, "rgba(126,184,255,0)");
  ctx.strokeStyle = acLine; ctx.lineWidth = 1.5 * sc;
  ctx.beginPath(); ctx.moveTo(100 * sx, 265 * sy); ctx.lineTo(W - 100 * sx, 265 * sy); ctx.stroke();

  // BIGGER DATE (No emoji)
  ctx.fillStyle = "#FFFFFF"; ctx.font = `bold ${Math.round(34 * sc)}px Georgia, serif`;
  ctx.textAlign = "center"; ctx.fillText(dateStr, cx, 320 * sy);

  ctx.beginPath(); ctx.moveTo(100 * sx, 360 * sy); ctx.lineTo(W - 100 * sx, 360 * sy); ctx.stroke();

  // === SIDE-BY-SIDE CARDS (PLACED BELOW, AT Y = 1240px) ===
  const cardY = 1240 * sy, cardH = 270 * sy, cardW = 480 * sx;
  const leftX = 40 * sx, leftCx = leftX + cardW / 2;
  const rightX = 560 * sx, rightCx = rightX + cardW / 2;

  // LEFT CARD: GOLD 22K (1g only)
  ctx.save();
  ctx.shadowColor = "rgba(0,100,255,0.3)"; ctx.shadowBlur = 16 * sc;
  const gPanel2 = ctx.createLinearGradient(leftX, cardY, leftX, cardY + cardH);
  gPanel2.addColorStop(0, "rgba(6,25,90,0.92)"); gPanel2.addColorStop(1, "rgba(3,14,55,0.95)");
  ctx.fillStyle = gPanel2; ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#7EB8FF"; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#7EB8FF"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 22K GOLD RATE", leftCx, cardY + 42 * sy);
  ctx.fillStyle = "#A5CFFF"; ctx.font = `bold ${Math.round(15 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", leftCx, cardY + 70 * sy);

  const divLine = ctx.createLinearGradient(leftX + 40 * sx, 0, leftX + cardW - 40 * sx, 0);
  divLine.addColorStop(0, "rgba(126,184,255,0)"); divLine.addColorStop(0.5, "rgba(126,184,255,0.5)"); divLine.addColorStop(1, "rgba(126,184,255,0)");
  ctx.strokeStyle = divLine; ctx.lineWidth = 1.5 * sc;
  ctx.beginPath(); ctx.moveTo(leftX + 40 * sx, cardY + 95 * sy); ctx.lineTo(leftX + cardW - 40 * sx, cardY + 95 * sy); ctx.stroke();

  ctx.shadowColor = "rgba(126,184,255,0.9)"; ctx.shadowBlur = 24 * sc;
  ctx.fillStyle = "#FFFFFF"; ctx.font = `bold ${Math.round(72 * sc)}px Georgia, serif`;
  ctx.fillText(rates.gold1gStr, leftCx, cardY + 195 * sy); ctx.shadowBlur = 0;

  // RIGHT CARD: SILVER 999 (1g only)
  ctx.save();
  ctx.shadowColor = "rgba(0,100,255,0.3)"; ctx.shadowBlur = 16 * sc;
  const sPanel2 = ctx.createLinearGradient(rightX, cardY, rightX, cardY + cardH);
  sPanel2.addColorStop(0, "rgba(10,35,80,0.92)"); sPanel2.addColorStop(1, "rgba(5,18,50,0.95)");
  ctx.fillStyle = sPanel2; ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#CBD5E1"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 999 FINE SILVER", rightCx, cardY + 42 * sy);
  ctx.fillStyle = "#94A3B8"; ctx.font = `bold ${Math.round(15 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", rightCx, cardY + 70 * sy);

  const divLineR = ctx.createLinearGradient(rightX + 40 * sx, 0, rightX + cardW - 40 * sx, 0);
  divLineR.addColorStop(0, "rgba(203,213,225,0)"); divLineR.addColorStop(0.5, "rgba(203,213,225,0.5)"); divLineR.addColorStop(1, "rgba(203,213,225,0)");
  ctx.strokeStyle = divLineR; ctx.lineWidth = 1.5 * sc;
  ctx.beginPath(); ctx.moveTo(rightX + 40 * sx, cardY + 95 * sy); ctx.lineTo(rightX + cardW - 40 * sx, cardY + 95 * sy); ctx.stroke();

  ctx.shadowColor = "rgba(226,232,240,0.85)"; ctx.shadowBlur = 24 * sc;
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(72 * sc)}px Georgia, serif`;
  ctx.fillText(rates.silver1gStr, rightCx, cardY + 195 * sy); ctx.shadowBlur = 0;

  // === FOOTER (1600px to H) ===
  const fY = 1600 * sy;
  ctx.strokeStyle = acLine; ctx.lineWidth = 1.5 * sc;
  ctx.beginPath(); ctx.moveTo(60 * sx, fY); ctx.lineTo(W - 60 * sx, fY); ctx.stroke();

  const fGrad2 = ctx.createLinearGradient(0, fY + 10 * sy, 0, H);
  fGrad2.addColorStop(0, "rgba(0,0,0,0)"); fGrad2.addColorStop(0.2, "rgba(4,16,60,0.96)"); fGrad2.addColorStop(1, "rgba(2,8,30,0.99)");
  ctx.fillStyle = fGrad2; ctx.fillRect(0, fY + 10 * sy, W, H - (fY + 10 * sy));

  // LEFT BOTTOM: Phone & Place
  const phoneX2 = 60 * sx;
  ctx.textAlign = "left";
  ctx.fillStyle = "#7EB8FF"; ctx.font = `bold ${Math.round(26 * sc)}px Arial, sans-serif`;
  ctx.fillText("\uD83D\uDCDE " + phone, phoneX2, fY + 110 * sy);
  ctx.fillStyle = "#B0D0F0"; ctx.font = `${Math.round(22 * sc)}px Arial, sans-serif`;
  ctx.fillText("\uD83D\uDCCD " + city, phoneX2, fY + 155 * sy);

  // RIGHT BOTTOM: BIS 916 Hallmark Emblem
  if (hallmarkImg && hallmarkImg.complete && hallmarkImg.naturalWidth > 0) {
    drawRealBIS916Hallmark(ctx, W - 160 * sx, fY + 132 * sy, sc * 0.78, "glass", hallmarkImg);
  } else {
    ctx.fillStyle = "#7EB8FF"; ctx.font = `bold ${Math.round(18 * sc)}px Arial, sans-serif`;
    ctx.textAlign = "right"; ctx.fillText("BIS 916 HALLMARKED", W - 40 * sx, fY + 132 * sy);
  }

  // BOTTOM CENTER: Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(165,207,255,0.75)"; ctx.font = `italic ${Math.round(23 * sc)}px Georgia, serif`;
  ctx.fillText('"Excellence in Every Carat"', cx, fY + 250 * sy);

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
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  const rates = getFormattedRates(livePrices);
  const phone = shopInfo?.phonePrimary || "+91 99520 54493";
  const city = shopInfo?.city || "Tuticorin";

  // TRANSLUCENT OVERLAY
  ctx.fillStyle = "rgba(0, 10, 5, 0.20)";
  ctx.fillRect(0, 0, W, H);

  // Top header dark scrim gradient
  const topScrim3 = ctx.createLinearGradient(0, 0, 0, 410 * sy);
  topScrim3.addColorStop(0, "rgba(1, 35, 15, 0.95)");
  topScrim3.addColorStop(0.75, "rgba(1, 35, 15, 0.75)");
  topScrim3.addColorStop(1, "rgba(0, 10, 5, 0)");
  ctx.fillStyle = topScrim3;
  ctx.fillRect(0, 0, W, 410 * sy);

  // Gold top line
  const topGoldGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGoldGrad.addColorStop(0, "rgba(212,175,55,0.2)"); topGoldGrad.addColorStop(0.5, "#D4AF37"); topGoldGrad.addColorStop(1, "rgba(212,175,55,0.2)");
  ctx.fillStyle = topGoldGrad; ctx.fillRect(0, 0, W, 7 * sy);

  // Header content
  drawShopLogoBadge(ctx, cx, 120 * sy, 50 * sc, shopLogoImg, shopName, sc);

  ctx.shadowColor = "rgba(212,175,55,0.55)"; ctx.shadowBlur = 16 * sc;
  ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(58 * sc)}px Georgia, serif`;
  ctx.textAlign = "center"; ctx.fillText(shopName, cx, 215 * sy); ctx.shadowBlur = 0;

  ctx.fillStyle = "#6EE7B7"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.fillText("BRIDAL & TRADITIONAL JEWELLERY", cx, 250 * sy);

  drawOrnamentalRule(ctx, 65 * sx, 275 * sy, W - 130 * sx, "#D4AF37", sc);

  // BIGGER DATE (No emoji)
  ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(34 * sc)}px Georgia, serif`;
  ctx.textAlign = "center"; ctx.fillText(dateStr, cx, 325 * sy);

  drawOrnamentalRule(ctx, 70 * sx, 365 * sy, W - 140 * sx, "#D4AF37", sc);

  // === SIDE-BY-SIDE CARDS (PLACED BELOW, AT Y = 1240px) ===
  const cardY = 1240 * sy, cardH = 270 * sy, cardW = 480 * sx;
  const leftX = 40 * sx, leftCx = leftX + cardW / 2;
  const rightX = 560 * sx, rightCx = rightX + cardW / 2;

  // LEFT CARD: GOLD 22K
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 16 * sc;
  const gPanel3 = ctx.createLinearGradient(leftX, cardY, leftX, cardY + cardH);
  gPanel3.addColorStop(0, "rgba(0,40,18,0.92)"); gPanel3.addColorStop(1, "rgba(0,22,10,0.95)");
  ctx.fillStyle = gPanel3; ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#D4AF37"; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 22K GOLD RATE", leftCx, cardY + 42 * sy);
  ctx.fillStyle = "#6EE7B7"; ctx.font = `bold ${Math.round(15 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", leftCx, cardY + 70 * sy);

  drawOrnamentalRule(ctx, leftX + 40 * sx, cardY + 95 * sy, cardW - 80 * sx, "rgba(212,175,55,0.5)", sc);

  ctx.shadowColor = "rgba(212,175,55,0.9)"; ctx.shadowBlur = 24 * sc;
  ctx.fillStyle = "#FFE566"; ctx.font = `bold ${Math.round(72 * sc)}px Georgia, serif`;
  ctx.fillText(rates.gold1gStr, leftCx, cardY + 195 * sy); ctx.shadowBlur = 0;

  // RIGHT CARD: SILVER 999
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 16 * sc;
  const sPanel3 = ctx.createLinearGradient(rightX, cardY, rightX, cardY + cardH);
  sPanel3.addColorStop(0, "rgba(5,30,25,0.92)"); sPanel3.addColorStop(1, "rgba(2,15,12,0.95)");
  ctx.fillStyle = sPanel3; ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#CBD5E1"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 999 FINE SILVER", rightCx, cardY + 42 * sy);
  ctx.fillStyle = "#94A3B8"; ctx.font = `bold ${Math.round(15 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", rightCx, cardY + 70 * sy);

  drawOrnamentalRule(ctx, rightX + 40 * sx, cardY + 95 * sy, cardW - 80 * sx, "rgba(203,213,225,0.5)", sc);

  ctx.shadowColor = "rgba(226,232,240,0.85)"; ctx.shadowBlur = 24 * sc;
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(72 * sc)}px Georgia, serif`;
  ctx.fillText(rates.silver1gStr, rightCx, cardY + 195 * sy); ctx.shadowBlur = 0;

  // === FOOTER (1600px to H) ===
  const fY = 1600 * sy;
  drawOrnamentalRule(ctx, 65 * sx, fY, W - 130 * sx, "#D4AF37", sc);

  const fGrad3 = ctx.createLinearGradient(0, fY + 10 * sy, 0, H);
  fGrad3.addColorStop(0, "rgba(0,0,0,0)"); fGrad3.addColorStop(0.2, "rgba(0,30,14,0.96)"); fGrad3.addColorStop(1, "rgba(0,10,5,0.99)");
  ctx.fillStyle = fGrad3; ctx.fillRect(0, fY + 10 * sy, W, H - (fY + 10 * sy));

  // LEFT BOTTOM: Phone & Place
  const phoneX3 = 65 * sx;
  ctx.textAlign = "left";
  ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(26 * sc)}px Arial, sans-serif`;
  ctx.fillText("\uD83D\uDCDE " + phone, phoneX3, fY + 110 * sy);
  ctx.fillStyle = "#A7F3D0"; ctx.font = `${Math.round(22 * sc)}px Arial, sans-serif`;
  ctx.fillText("\uD83D\uDCCD " + city, phoneX3, fY + 155 * sy);

  // RIGHT BOTTOM: BIS 916 Hallmark Emblem
  if (hallmarkImg && hallmarkImg.complete && hallmarkImg.naturalWidth > 0) {
    drawRealBIS916Hallmark(ctx, W - 160 * sx, fY + 132 * sy, sc * 0.78, "emerald", hallmarkImg);
  } else {
    ctx.fillStyle = "#FFDA6A"; ctx.font = `bold ${Math.round(18 * sc)}px Arial, sans-serif`;
    ctx.textAlign = "right"; ctx.fillText("BIS 916 HALLMARKED", W - 40 * sx, fY + 132 * sy);
  }

  // BOTTOM CENTER: Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(200,255,210,0.75)"; ctx.font = `italic ${Math.round(23 * sc)}px Georgia, serif`;
  ctx.fillText('"Your Heritage, Our Craft"', cx, fY + 250 * sy);

  ctx.fillStyle = topGoldGrad; ctx.fillRect(0, H - 7 * sy, W, 7 * sy);
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
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  const rates = getFormattedRates(livePrices);
  const phone = shopInfo?.phonePrimary || "+91 99520 54493";
  const city = shopInfo?.city || "Tuticorin";

  // TRANSLUCENT OVERLAY
  ctx.fillStyle = "rgba(15, 8, 4, 0.20)";
  ctx.fillRect(0, 0, W, H);

  // Top header dark scrim gradient
  const topScrim4 = ctx.createLinearGradient(0, 0, 0, 410 * sy);
  topScrim4.addColorStop(0, "rgba(40, 22, 8, 0.95)");
  topScrim4.addColorStop(0.75, "rgba(40, 22, 8, 0.75)");
  topScrim4.addColorStop(1, "rgba(15, 8, 4, 0)");
  ctx.fillStyle = topScrim4;
  ctx.fillRect(0, 0, W, 410 * sy);

  // Rose gold side stripes
  const lsW = 14 * sx;
  const lsGrad = ctx.createLinearGradient(0, 0, lsW, 0);
  lsGrad.addColorStop(0, "#A06040"); lsGrad.addColorStop(1, "#D4916A");
  ctx.fillStyle = lsGrad; ctx.fillRect(0, 0, lsW, H);
  const rsGrad = ctx.createLinearGradient(W - lsW, 0, W, 0);
  rsGrad.addColorStop(0, "#D4916A"); rsGrad.addColorStop(1, "#A06040");
  ctx.fillStyle = rsGrad; ctx.fillRect(W - lsW, 0, lsW, H);

  const roseBar = ctx.createLinearGradient(0, 0, W, 0);
  roseBar.addColorStop(0, "rgba(212,145,106,0.3)"); roseBar.addColorStop(0.5, "rgba(212,145,106,0.9)"); roseBar.addColorStop(1, "rgba(212,145,106,0.3)");
  ctx.fillStyle = roseBar; ctx.fillRect(lsW, 0, W - lsW * 2, 6 * sy);

  // Header content
  drawShopLogoBadge(ctx, cx, 110 * sy, 50 * sc, shopLogoImg, shopName, sc);

  ctx.shadowColor = "rgba(212,145,106,0.45)"; ctx.shadowBlur = 18 * sc;
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(58 * sc)}px Georgia, serif`;
  ctx.textAlign = "center"; ctx.fillText(shopName, cx, 205 * sy); ctx.shadowBlur = 0;

  ctx.fillStyle = "#D4916A"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.fillText("SOLITAIRE & FINE JEWELLERY", cx, 240 * sy);

  drawOrnamentalRule(ctx, 75 * sx, 265 * sy, W - 150 * sx, "#C08050", sc);

  // BIGGER DATE (No emoji)
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(34 * sc)}px Georgia, serif`;
  ctx.textAlign = "center"; ctx.fillText(dateStr, cx, 320 * sy);

  drawOrnamentalRule(ctx, 70 * sx, 360 * sy, W - 140 * sx, "#D4916A", sc);

  // === SIDE-BY-SIDE CARDS (PLACED BELOW, AT Y = 1240px) ===
  const cardY = 1240 * sy, cardH = 270 * sy, cardW = 480 * sx;
  const leftX = 40 * sx, leftCx = leftX + cardW / 2;
  const rightX = 560 * sx, rightCx = rightX + cardW / 2;

  // LEFT CARD: GOLD 22K
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 16 * sc;
  const gPanel4 = ctx.createLinearGradient(leftX, cardY, leftX, cardY + cardH);
  gPanel4.addColorStop(0, "rgba(40,22,8,0.92)"); gPanel4.addColorStop(1, "rgba(20,10,4,0.95)");
  ctx.fillStyle = gPanel4; ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#D4916A"; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); roundRect(ctx, leftX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#D4916A"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 22K GOLD RATE", leftCx, cardY + 42 * sy);
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(15 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", leftCx, cardY + 70 * sy);

  drawOrnamentalRule(ctx, leftX + 40 * sx, cardY + 95 * sy, cardW - 80 * sx, "rgba(212,145,106,0.5)", sc);

  ctx.shadowColor = "rgba(212,145,106,0.9)"; ctx.shadowBlur = 24 * sc;
  ctx.fillStyle = "#F5E4C8"; ctx.font = `bold ${Math.round(72 * sc)}px Georgia, serif`;
  ctx.fillText(rates.gold1gStr, leftCx, cardY + 195 * sy); ctx.shadowBlur = 0;

  // RIGHT CARD: SILVER 999
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 16 * sc;
  const sPanel4 = ctx.createLinearGradient(rightX, cardY, rightX, cardY + cardH);
  sPanel4.addColorStop(0, "rgba(22,16,12,0.92)"); sPanel4.addColorStop(1, "rgba(10,8,6,0.95)");
  ctx.fillStyle = sPanel4; ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 2 * sc;
  ctx.beginPath(); roundRect(ctx, rightX, cardY, cardW, cardH, 20 * sc); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "#CBD5E1"; ctx.font = `bold ${Math.round(20 * sc)}px Arial, sans-serif`;
  ctx.textAlign = "center"; ctx.fillText("TODAY'S 999 FINE SILVER", rightCx, cardY + 42 * sy);
  ctx.fillStyle = "#94A3B8"; ctx.font = `bold ${Math.round(15 * sc)}px Arial, sans-serif`;
  ctx.fillText("PER 1 GRAM", rightCx, cardY + 70 * sy);

  drawOrnamentalRule(ctx, rightX + 40 * sx, cardY + 95 * sy, cardW - 80 * sx, "rgba(203,213,225,0.5)", sc);

  ctx.shadowColor = "rgba(226,232,240,0.85)"; ctx.shadowBlur = 24 * sc;
  ctx.fillStyle = "#F8FAFC"; ctx.font = `bold ${Math.round(72 * sc)}px Georgia, serif`;
  ctx.fillText(rates.silver1gStr, rightCx, cardY + 195 * sy); ctx.shadowBlur = 0;

  // === FOOTER (1600px to H) ===
  const fY = 1600 * sy;
  drawOrnamentalRule(ctx, 75 * sx, fY, W - 150 * sx, "#C08050", sc);

  const fGrad4 = ctx.createLinearGradient(0, fY + 10 * sy, 0, H);
  fGrad4.addColorStop(0, "rgba(0,0,0,0)"); fGrad4.addColorStop(0.2, "rgba(28,16,6,0.96)"); fGrad4.addColorStop(1, "rgba(12,6,2,0.99)");
  ctx.fillStyle = fGrad4; ctx.fillRect(0, fY + 10 * sy, W, H - (fY + 10 * sy));

  // LEFT BOTTOM: Phone & Place
  const phoneX4 = 75 * sx;
  ctx.textAlign = "left";
  ctx.fillStyle = "#D4916A"; ctx.font = `bold ${Math.round(26 * sc)}px Arial, sans-serif`;
  ctx.fillText("\uD83D\uDCDE " + phone, phoneX4, fY + 110 * sy);
  ctx.fillStyle = "#C8A878"; ctx.font = `${Math.round(22 * sc)}px Arial, sans-serif`;
  ctx.fillText("\uD83D\uDCCD " + city, phoneX4, fY + 155 * sy);

  // RIGHT BOTTOM: BIS 916 Hallmark Emblem
  if (hallmarkImg && hallmarkImg.complete && hallmarkImg.naturalWidth > 0) {
    drawRealBIS916Hallmark(ctx, W - 160 * sx, fY + 132 * sy, sc * 0.78, "gold", hallmarkImg);
  } else {
    ctx.fillStyle = "#D4916A"; ctx.font = `bold ${Math.round(18 * sc)}px Arial, sans-serif`;
    ctx.textAlign = "right"; ctx.fillText("BIS 916 HALLMARKED", W - 40 * sx, fY + 132 * sy);
  }

  // BOTTOM CENTER: Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(200,150,100,0.75)"; ctx.font = `italic ${Math.round(23 * sc)}px Georgia, serif`;
  ctx.fillText('"Where Luxury Meets Tradition"', cx, fY + 250 * sy);

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
    const video = document.createElement("video");
    video.src = resolveFullImageUrl(videoUrl);
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

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
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "/bis_916_hallmark.png";
    img.onload = () => setLoadedHallmarkLogo(img);
    img.onerror = () => setLoadedHallmarkLogo(null);
  }, []);

  // Preload Shop Logo Image whenever shopInfo.logo changes
  useEffect(() => {
    const rawLogoUrl = shopInfo?.logo || shopInfo?.logoUrl;
    if (rawLogoUrl) {
      loadSingleImage(rawLogoUrl).then((loadedImg) => {
        setLoadedShopLogo(loadedImg);
      });
    } else {
      setLoadedShopLogo(null);
    }
  }, [shopInfo?.logo, shopInfo?.logoUrl]);

  useEffect(() => {
    async function loadData() {
      try {
        const [siteRes, assetsRes] = await Promise.all([
          getSiteInfo(),
          getBasicAssets(),
        ]);

        if (siteRes && siteRes.success === 1 && Array.isArray(siteRes.priceData)) {
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

        let activeShopLogo = loadedShopLogo;
        const targetShopLogoUrl = shopInfo?.logo || shopInfo?.logoUrl;
        if ((!activeShopLogo || !activeShopLogo.complete || activeShopLogo.naturalWidth === 0) && targetShopLogoUrl) {
          activeShopLogo = await loadSingleImage(targetShopLogoUrl);
        }
        let activeHallmarkLogo = loadedHallmarkLogo;
        if (!activeHallmarkLogo || !activeHallmarkLogo.complete || activeHallmarkLogo.naturalWidth === 0) {
          activeHallmarkLogo = await loadSingleImage("/bis_916_hallmark.png");
        }

        const activeSubdomain = getTenantSubdomain();
        const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase();
        const shopNameStr = (shopInfo?.name || defaultShopName).toUpperCase();

        if (bgImageUrl) {
          const bgImg = await loadSingleImage(bgImageUrl);
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

        if (canvas.toBlob) {
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              resolve({ blobUrl, shopName: shopNameStr, cardNum });
            } else {
              try {
                resolve({ blobUrl: canvas.toDataURL("image/png"), shopName: shopNameStr, cardNum });
              } catch (e) {
                resolve(null);
              }
            }
          }, "image/png");
        } else {
          try {
            resolve({ blobUrl: canvas.toDataURL("image/png"), shopName: shopNameStr, cardNum });
          } catch (e) {
            resolve(null);
          }
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
    setSuccessInfo(null);

    const activeSubdomain = getTenantSubdomain();
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase();
    const shopName = (shopInfo?.name || defaultShopName).toUpperCase();
    const cleanName = shopName.toLowerCase().replace(/\s+/g, "_");

    const videoPath = previewData?.previewUrl || `/status_videos/${fileName || `aadagam${videoNumber}.mp4`}`;
    const fullVideoUrl = resolveFullImageUrl(videoPath);

    try {
      // High-Speed Direct Stream Download (1-2 Seconds completion!)
      const response = await fetch(fullVideoUrl, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP fetch error ${response.status}`);
      
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${cleanName}_template${templateId}_whatsapp_status_video_${videoNumber}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);

      setDownloadingId(null);
      setSuccessInfo({
        title: `${label || `Status Video ${videoNumber}`} Downloaded!`,
        desc: `HD WhatsApp Status Video (${label}) for ${shopName} saved successfully!`,
        type: "video",
      });
    } catch (err) {
      console.warn("Direct blob video fetch fallback to standard anchor download:", err);
      // Fallback: Direct Browser Anchor Download
      const link = document.createElement("a");
      link.href = fullVideoUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = `${cleanName}_template${templateId}_whatsapp_status_video_${videoNumber}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadingId(null);
      setSuccessInfo({
        title: `${label || `Status Video ${videoNumber}`} Download Started!`,
        desc: `WhatsApp Status Video #${videoNumber} (${label}) download started successfully!`,
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
                    <span className="text-stone-400">Hallmark Seal:</span>
                    <span className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                      <img src="/bis_916_hallmark.png" alt="Official BIS 916 Hallmark" className="h-5 object-contain bg-white/90 px-1 py-0.5 rounded" />
                      <span>BIS 916 Official</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
                    <span className="text-stone-400">Live Gold Rate (22K):</span>
                    <span className="font-number font-bold text-amber-300 text-sm">{livePrices.gold22k} /g</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">Live Silver Rate (999):</span>
                    <span className="font-number font-bold text-stone-200 text-sm">{livePrices.silver999} /g</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                  Stamped with official 100% BIS Hallmarked 916 gold emblem, live metal rates in Cinzel typography, showroom logo, and contact phone number.
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
                      setPreviewData(null);
                    }}
                    disabled={downloadingId !== null}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-900/20 hover:scale-[1.01] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {downloadingId ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                        <span>Branding & Downloading Video...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-emerald-200" />
                        <span>Download Template #{previewData.templateId} Video</span>
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
