import React, { useState, useEffect } from "react";
import { Download, Sparkles, Video, Image, CheckCircle2, Loader2, X, Play } from "lucide-react";
import { getSiteInfo, getBasicAssets } from "../services/api";
import { getTenantSubdomain, getShopPrefix } from "../services/apiClient";

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
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
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
// 4 DISTINCT ELEGANT OVERLAY TEMPLATE RENDERERS
// ==========================================

/**
 * TEMPLATE 1: Royal Heritage Gold (Classic Regal Luxury)
 */
const drawTemplate1_RoyalHeritage = (ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const scaleX = canvasWidth / 1080;
  const scaleY = canvasHeight / 1920;
  const scale = Math.min(scaleX, scaleY);
  const centerX = canvasWidth / 2;

  // Double Ornate Gold Frame
  const margin = 28 * scale;
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 5 * scale;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(margin, margin, canvasWidth - 2 * margin, canvasHeight - 2 * margin, 36 * scale);
  else ctx.rect(margin, margin, canvasWidth - 2 * margin, canvasHeight - 2 * margin);
  ctx.stroke();

  ctx.strokeStyle = "rgba(243, 229, 171, 0.6)";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(margin + 10 * scale, margin + 10 * scale, canvasWidth - 2 * (margin + 10 * scale), canvasHeight - 2 * (margin + 10 * scale), 26 * scale);
  ctx.stroke();

  // Top Shop Logo Emblem
  const logoY = 145 * scaleY;
  drawShopLogoBadge(ctx, centerX, logoY, 58 * scale, shopLogoImg, shopName, scale);

  // Shop Name & Subheader
  ctx.fillStyle = "#D4AF37";
  ctx.font = `bold ${Math.round(58 * scale)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText(shopName, centerX, 255 * scaleY);

  ctx.fillStyle = "#FAF9F5";
  ctx.font = `bold ${Math.round(24 * scale)}px sans-serif`;
  ctx.fillText("ROYAL HERITAGE SHOWROOM COLLECTION", centerX, 305 * scaleY);

  // Decorative Divider
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(centerX - 210 * scaleX, 345 * scaleY);
  ctx.lineTo(centerX + 210 * scaleX, 345 * scaleY);
  ctx.stroke();

  // Official BIS 916 Hallmark Logo Image Badge (Positioned with zero collision)
  drawRealBIS916Hallmark(ctx, centerX, canvasHeight - 440 * scaleY, scale * 1.05, "gold", hallmarkImg);

  ctx.fillStyle = "#FAF9F5";
  ctx.font = `bold ${Math.round(25 * scale)}px sans-serif`;
  ctx.fillText("100% BIS Hallmarked 22K Gold & Certified Diamonds", centerX, canvasHeight - 325 * scaleY);

  ctx.fillStyle = "#D4AF37";
  ctx.font = `bold ${Math.round(34 * scale)}px Cinzel, sans-serif`;
  ctx.fillText(shopInfo?.phonePrimary || "+91 99520 54493", centerX, canvasHeight - 265 * scaleY);

  // Bottom Silver & Gold Rate Badges
  const badgeW = 440 * scaleX;
  const badgeH = 155 * scaleY;
  const silverX = 60 * scaleX;
  const badgeY = canvasHeight - 215 * scaleY;

  // Silver Rate Badge
  const silverGrad = ctx.createLinearGradient(silverX, badgeY, silverX + badgeW, badgeY + badgeH);
  silverGrad.addColorStop(0, "rgba(255, 253, 248, 0.96)");
  silverGrad.addColorStop(1, "rgba(240, 236, 222, 0.94)");
  ctx.fillStyle = silverGrad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(silverX, badgeY, badgeW, badgeH, 22 * scale);
  ctx.fill();
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  ctx.fillStyle = "#44403C";
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("SILVER RATE (999)", silverX + badgeW / 2, badgeY + 45 * scaleY);

  ctx.fillStyle = "#1C1917";
  ctx.font = `bold ${Math.round(46 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillText(`${livePrices.silver999 || '₹94.50'} /g`, silverX + badgeW / 2, badgeY + 110 * scaleY);

  // Gold Rate Badge
  const goldX = canvasWidth - badgeW - 60 * scaleX;
  const goldGrad = ctx.createLinearGradient(goldX, badgeY, goldX + badgeW, badgeY + badgeH);
  goldGrad.addColorStop(0, "rgba(255, 251, 235, 0.96)");
  goldGrad.addColorStop(1, "rgba(254, 243, 199, 0.94)");
  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(goldX, badgeY, badgeW, badgeH, 22 * scale);
  ctx.fill();
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2.8 * scale;
  ctx.stroke();

  ctx.fillStyle = "#78350F";
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("GOLD RATE (22K)", goldX + badgeW / 2, badgeY + 45 * scaleY);

  ctx.fillStyle = "#1C1917";
  ctx.font = `bold ${Math.round(46 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillText(`${livePrices.gold22k || '₹7,195'} /g`, goldX + badgeW / 2, badgeY + 110 * scaleY);

  ctx.restore();
};

/**
 * TEMPLATE 2: Modern Minimalist Boutique (Clean Frosted Glass)
 */
const drawTemplate2_ModernMinimalist = (ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const scaleX = canvasWidth / 1080;
  const scaleY = canvasHeight / 1920;
  const scale = Math.min(scaleX, scaleY);

  // Top Left: Floating Official BIS 916 Hallmark Badge
  drawRealBIS916Hallmark(ctx, 175 * scaleX, 95 * scaleY, scale * 0.92, "glass", hallmarkImg);

  // Top Right: Floating Shop Emblem Badge
  drawShopLogoBadge(ctx, canvasWidth - 110 * scaleX, 95 * scaleY, 44 * scale, shopLogoImg, shopName, scale);

  // Below Middle of the Image: Centered Frosted Glass Shop Name Panel
  const panelW = 740 * scaleX;
  const panelH = 115 * scaleY;
  const panelX = canvasWidth / 2 - panelW / 2;
  const panelY = canvasHeight - 380 * scaleY;

  ctx.fillStyle = "rgba(12, 12, 12, 0.88)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(panelX, panelY, panelW, panelH, 26 * scale);
  ctx.fill();
  ctx.strokeStyle = "rgba(212, 175, 55, 0.75)";
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  // Shop Name centered in the below middle of the image
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(44 * scale)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText(shopName, canvasWidth / 2, panelY + 48 * scaleY);

  ctx.fillStyle = "#D4AF37";
  ctx.font = `bold ${Math.round(18 * scale)}px sans-serif`;
  ctx.fillText("BOUTIQUE JEWELLERY", canvasWidth / 2, panelY + 86 * scaleY);

  // Bottom Sleek Horizontal Capsule Bar for Live Metal Rates
  const botW = canvasWidth - 100 * scaleX;
  const botH = 210 * scaleY;
  const botX = 50 * scaleX;
  const botY = canvasHeight - botH - 45 * scaleY;

  ctx.fillStyle = "rgba(10, 10, 10, 0.92)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(botX, botY, botW, botH, 28 * scale);
  ctx.fill();
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 3 * scale;
  ctx.stroke();

  // Inner Vertical Divider Line
  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.moveTo(botX + botW / 2, botY + 22 * scaleY);
  ctx.lineTo(botX + botW / 2, botY + botH - 60 * scaleY);
  ctx.stroke();

  // Left: Silver Rate
  ctx.fillStyle = "#A8A29E";
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("SILVER RATE (999)", botX + botW / 4, botY + 48 * scaleY);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(46 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillText(`${livePrices.silver999 || '₹94.50'} /g`, botX + botW / 4, botY + 115 * scaleY);

  // Right: Gold Rate
  ctx.fillStyle = "#FBBF24";
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("GOLD RATE (22K)", botX + (3 * botW) / 4, botY + 48 * scaleY);

  ctx.fillStyle = "#FCD34D";
  ctx.font = `bold ${Math.round(46 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillText(`${livePrices.gold22k || '₹7,195'} /g`, botX + (3 * botW) / 4, botY + 115 * scaleY);

  // Bottom Contact & Hallmark Certification Strip
  ctx.fillStyle = "#FAF9F5";
  ctx.font = `bold ${Math.round(22 * scale)}px Cinzel, sans-serif`;
  ctx.fillText(`100% BIS Hallmarked • Call / WhatsApp: ${shopInfo?.phonePrimary || "+91 99520 54493"}`, canvasWidth / 2, botY + 180 * scaleY);

  ctx.restore();
};

/**
 * TEMPLATE 3: Bridal Emerald & Gold (Rich Traditional Opulence)
 */
const drawTemplate3_BridalEmerald = (ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const scaleX = canvasWidth / 1080;
  const scaleY = canvasHeight / 1920;
  const scale = Math.min(scaleX, scaleY);

  // Top Banner (Emerald Gradient)
  const topH = 210 * scaleY;
  const topGrad = ctx.createLinearGradient(0, 0, 0, topH);
  topGrad.addColorStop(0, "rgba(4, 47, 36, 0.98)");
  topGrad.addColorStop(1, "rgba(6, 78, 59, 0.94)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, canvasWidth, topH);

  // Gold Trim Line at bottom of header
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(0, topH);
  ctx.lineTo(canvasWidth, topH);
  ctx.stroke();

  // Top Left: Shop Logo Badge
  drawShopLogoBadge(ctx, 90 * scaleX, topH / 2, 42 * scale, shopLogoImg, shopName, scale);

  // Header Text
  ctx.fillStyle = "#FCD34D";
  ctx.font = `bold ${Math.round(40 * scale)}px Georgia, serif`;
  ctx.textAlign = "left";
  ctx.fillText(shopName, 150 * scaleX, topH / 2 - 7 * scaleY);

  ctx.fillStyle = "#ECFDF5";
  ctx.font = `bold ${Math.round(19 * scale)}px sans-serif`;
  ctx.fillText("BRIDAL & TRADITIONAL JEWELLERY", 150 * scaleX, topH / 2 + 29 * scaleY);

  // Top Right: Authentic Official BIS 916 Hallmark Stamp
  drawRealBIS916Hallmark(ctx, canvasWidth - 165 * scaleX, topH / 2, scale * 0.90, "emerald", hallmarkImg);

  // Bottom Banner (Emerald Gradient)
  const botH = 320 * scaleY;
  const botY = canvasHeight - botH;
  const botGrad = ctx.createLinearGradient(0, botY, 0, canvasHeight);
  botGrad.addColorStop(0, "rgba(6, 78, 59, 0.95)");
  botGrad.addColorStop(1, "rgba(2, 44, 34, 0.98)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, botY, canvasWidth, botH);

  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 4 * scale;
  ctx.beginPath();
  ctx.moveTo(0, botY);
  ctx.lineTo(canvasWidth, botY);
  ctx.stroke();

  // Tagline
  ctx.fillStyle = "#FCD34D";
  ctx.font = `bold ${Math.round(24 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("100% BIS Hallmarked 22K Gold • Certified Solitaire Diamonds", canvasWidth / 2, botY + 42 * scaleY);

  // Dual Rate Pills
  const pillW = 440 * scaleX;
  const pillH = 135 * scaleY;
  const pillY = botY + 75 * scaleY;

  // Silver Pill
  const silX = 60 * scaleX;
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(silX, pillY, pillW, pillH, 22 * scale);
  ctx.fill();
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  ctx.fillStyle = "#064E3B";
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.fillText("SILVER RATE (999)", silX + pillW / 2, pillY + 42 * scaleY);

  ctx.fillStyle = "#022C22";
  ctx.font = `bold ${Math.round(42 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillText(`${livePrices.silver999 || '₹94.50'} /g`, silX + pillW / 2, pillY + 98 * scaleY);

  // Gold Pill
  const gldX = canvasWidth - pillW - 60 * scaleX;
  ctx.fillStyle = "rgba(254, 243, 199, 0.96)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(gldX, pillY, pillW, pillH, 22 * scale);
  ctx.fill();
  ctx.strokeStyle = "#B45309";
  ctx.lineWidth = 2.8 * scale;
  ctx.stroke();

  ctx.fillStyle = "#78350F";
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.fillText("GOLD RATE (22K)", gldX + pillW / 2, pillY + 42 * scaleY);

  ctx.fillStyle = "#451A03";
  ctx.font = `bold ${Math.round(42 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillText(`${livePrices.gold22k || '₹7,195'} /g`, gldX + pillW / 2, pillY + 98 * scaleY);

  // Phone Contact
  ctx.fillStyle = "#FCD34D";
  ctx.font = `bold ${Math.round(28 * scale)}px Cinzel, sans-serif`;
  ctx.fillText(`WhatsApp Orders: ${shopInfo?.phonePrimary || "+91 99520 54493"}`, canvasWidth / 2, botY + 270 * scaleY);

  ctx.restore();
};

/**
 * TEMPLATE 4: Contemporary Solitaire Dark (Obsidian Glamour)
 */
const drawTemplate4_SolitaireDark = (ctx, canvasWidth, canvasHeight, shopName, shopLogoImg, livePrices, shopInfo, hallmarkImg = null) => {
  ctx.save();
  const scaleX = canvasWidth / 1080;
  const scaleY = canvasHeight / 1920;
  const scale = Math.min(scaleX, scaleY);

  // Dark Header Panel
  const topH = 200 * scaleY;
  const topGrad = ctx.createLinearGradient(0, 0, 0, topH);
  topGrad.addColorStop(0, "rgba(10, 10, 10, 0.96)");
  topGrad.addColorStop(1, "rgba(24, 20, 14, 0.92)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, canvasWidth, topH);

  // Accent Divider
  ctx.strokeStyle = "#F3E5AB";
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(0, topH);
  ctx.lineTo(canvasWidth, topH);
  ctx.stroke();

  // Left: Shop Logo Badge
  drawShopLogoBadge(ctx, 90 * scaleX, topH / 2, 40 * scale, shopLogoImg, shopName, scale);

  // Center: Shop Name
  ctx.fillStyle = "#F3E5AB";
  ctx.font = `bold ${Math.round(40 * scale)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText(shopName, canvasWidth / 2 - 45 * scaleX, topH / 2 - 7 * scaleY);

  ctx.fillStyle = "#D4AF37";
  ctx.font = `bold ${Math.round(18 * scale)}px sans-serif`;
  ctx.fillText("SOLITAIRE & FINE JEWELLERY", canvasWidth / 2 - 45 * scaleX, topH / 2 + 28 * scaleY);

  // Right: Authentic Official BIS 916 Hallmark Seal
  drawRealBIS916Hallmark(ctx, canvasWidth - 160 * scaleX, topH / 2, scale * 0.88, "dark", hallmarkImg);

  // Bottom Metallic Ticker Panel
  const botH = 300 * scaleY;
  const botY = canvasHeight - botH;
  const botGrad = ctx.createLinearGradient(0, botY, 0, canvasHeight);
  botGrad.addColorStop(0, "rgba(24, 20, 14, 0.94)");
  botGrad.addColorStop(1, "rgba(8, 8, 8, 0.98)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, botY, canvasWidth, botH);

  ctx.strokeStyle = "#F3E5AB";
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(0, botY);
  ctx.lineTo(canvasWidth, botY);
  ctx.stroke();

  // Center Tagline
  ctx.fillStyle = "#FAF9F5";
  ctx.font = `bold ${Math.round(24 * scale)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("100% BIS Hallmarked 22K Gold & Certified Solitaire Diamonds", canvasWidth / 2, botY + 42 * scaleY);

  // Left Box: Silver Rate
  const boxW = 430 * scaleX;
  const boxH = 125 * scaleY;
  const boxY = botY + 72 * scaleY;

  const silX = 60 * scaleX;
  ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(silX, boxY, boxW, boxH, 20 * scale);
  ctx.fill();
  ctx.strokeStyle = "rgba(243, 229, 171, 0.5)";
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  ctx.fillStyle = "#D6D3D1";
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.fillText("SILVER RATE (999)", silX + boxW / 2, boxY + 38 * scaleY);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(42 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillText(`${livePrices.silver999 || '₹94.50'} /g`, silX + boxW / 2, boxY + 92 * scaleY);

  // Right Box: Gold Rate
  const gldX = canvasWidth - boxW - 60 * scaleX;
  ctx.fillStyle = "rgba(243, 229, 171, 0.14)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(gldX, boxY, boxW, boxH, 20 * scale);
  ctx.fill();
  ctx.strokeStyle = "#F3E5AB";
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  ctx.fillStyle = "#FCD34D";
  ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
  ctx.fillText("GOLD RATE (22K)", gldX + boxW / 2, boxY + 38 * scaleY);

  ctx.fillStyle = "#F3E5AB";
  ctx.font = `bold ${Math.round(42 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillText(`${livePrices.gold22k || '₹7,195'} /g`, gldX + boxW / 2, boxY + 92 * scaleY);

  // Bottom Phone
  ctx.fillStyle = "#F3E5AB";
  ctx.font = `bold ${Math.round(26 * scale)}px Cinzel, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(`Showroom Contact: ${shopInfo?.phonePrimary || "+91 99520 54493"}`, canvasWidth / 2, botY + 254 * scaleY);

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
// VIDEO CANVAS PREVIEW COMPONENT
// ==========================================

function VideoCanvasPreview({ videoUrl, shopName, templateId, drawOverlay, shopLogoImg, livePrices, shopInfo, hallmarkImg }) {
  const canvasRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = React.useState(true);

  React.useEffect(() => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    let animId;

    const startAnimation = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext("2d");

      video.play().catch(() => {});

      const render = () => {
        if (ctx && canvas) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          drawOverlay(ctx, canvas.width, canvas.height, shopName, templateId, shopLogoImg, livePrices, shopInfo, hallmarkImg);
        }
        animId = requestAnimationFrame(render);
      };
      render();
    };

    video.onloadeddata = startAnimation;

    return () => {
      cancelAnimationFrame(animId);
      if (video) {
        video.pause();
        video.src = "";
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

// ==========================================
// MAIN SECTION COMPONENT
// ==========================================

export default function WhatsAppStatusSection({ shopInfo }) {
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
    gold22k: "₹7,195",
    silver999: "₹94.50",
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
    const logoUrl = shopInfo?.logo || shopInfo?.logoUrl;
    if (logoUrl) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = logoUrl;
      img.onload = () => setLoadedShopLogo(img);
      img.onerror = () => setLoadedShopLogo(null);
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
          let goldVal = "₹7,195";
          let silverVal = "₹94.50";
          siteRes.priceData.forEach((item) => {
            const mat = (item.material || "").toLowerCase();
            const purity = (item.purity || "").toLowerCase();
            const price = Number(item.price);
            if (!isNaN(price) && price > 0) {
              if (mat === "gold" && purity.includes("22")) {
                goldVal = `₹${price.toLocaleString("en-IN")}`;
              }
              if (mat === "silver" && (purity.includes("24") || purity.includes("925"))) {
                silverVal = `₹${price.toLocaleString("en-IN")}`;
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
      label: "Royal Heritage",
      desc: "Regal Double Gold Border",
      theme: {
        bg: "bg-gradient-to-br from-[#854D0E] via-[#A16207] to-[#713F12] hover:from-[#A16207] hover:to-[#854D0E]",
        border: "border-[#FDE047]/60 hover:border-[#FFFFFF]",
        shadow: "shadow-lg shadow-amber-950/40 hover:shadow-xl hover:shadow-amber-900/60",
        iconWrapper: "bg-amber-950/80 border border-[#FDE047]/50 text-[#FEF08A]",
        titleColor: "text-white font-serif",
        actionColor: "text-[#FEF08A] group-hover:text-white",
        accentDot: "bg-[#FDE047]",
      },
    },
    {
      id: 2,
      label: "Modern Minimalist",
      desc: "Clean Frosted Glass Panels",
      theme: {
        bg: "bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#0F172A] hover:from-[#312E81] hover:to-[#1E1B4B]",
        border: "border-indigo-400/50 hover:border-indigo-200",
        shadow: "shadow-lg shadow-indigo-950/40 hover:shadow-xl hover:shadow-indigo-900/60",
        iconWrapper: "bg-indigo-950/80 border border-indigo-400/40 text-indigo-200",
        titleColor: "text-white font-serif",
        actionColor: "text-indigo-200 group-hover:text-white",
        accentDot: "bg-indigo-300",
      },
    },
    {
      id: 3,
      label: "Bridal Emerald",
      desc: "Emerald & Gold Leaf Ribbons",
      theme: {
        bg: "bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022C22] hover:from-[#047857] hover:to-[#064E3B]",
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
      label: "Solitaire Dark",
      desc: "Champagne Gold Ticker",
      theme: {
        bg: "bg-gradient-to-br from-[#581C87] via-[#6B21A8] to-[#3B0764] hover:from-[#6B21A8] hover:to-[#581C87]",
        border: "border-purple-400/50 hover:border-amber-300",
        shadow: "shadow-lg shadow-purple-950/40 hover:shadow-xl hover:shadow-purple-900/60",
        iconWrapper: "bg-purple-950/80 border border-purple-400/40 text-purple-200",
        titleColor: "text-white font-serif",
        actionColor: "text-purple-200 group-hover:text-white",
        accentDot: "bg-purple-300",
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
    {
      id: 3,
      label: "Bridal Emerald Reel",
      desc: "Emerald Banner Reel",
      theme: {
        bg: "bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#431407] hover:from-[#C2410C] hover:to-[#7C2D12]",
        border: "border-orange-400/60 hover:border-white",
        shadow: "shadow-lg shadow-orange-950/40 hover:shadow-xl hover:shadow-orange-900/60",
        iconWrapper: "bg-orange-950/80 border border-orange-400/40 text-orange-200",
        titleColor: "text-white font-serif",
        actionColor: "text-orange-200 group-hover:text-white",
        accentDot: "bg-orange-300",
      },
    },
    {
      id: 4,
      label: "Solitaire Dark Reel",
      desc: "Champagne Ticker Reel",
      theme: {
        bg: "bg-gradient-to-br from-[#831843] via-[#BE185D] to-[#500724] hover:from-[#BE185D] hover:to-[#831843]",
        border: "border-pink-400/60 hover:border-white",
        shadow: "shadow-lg shadow-pink-950/40 hover:shadow-xl hover:shadow-pink-900/60",
        iconWrapper: "bg-pink-950/80 border border-pink-400/40 text-pink-200",
        titleColor: "text-white font-serif",
        actionColor: "text-pink-200 group-hover:text-white",
        accentDot: "bg-pink-300",
      },
    },
  ];

  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  /**
   * Generates a high-resolution 1080x1920 9:16 Status Card PNG for a given template
   */
  const generateImageCardDataUrl = (label, cardNum, templateId = 1, imageUrl = '') => {
    return new Promise(async (resolve) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");

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

        const getRandomImg = Math.floor(Math.random() * 30) + 1;

        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl || `/aadagam (${getRandomImg}).png`;

        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const activeSubdomain = getTenantSubdomain();
          const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase() + " JEWELLERY";
          const shopName = (shopInfo?.name || defaultShopName).toUpperCase();

          drawStatusOverlay(ctx, canvas.width, canvas.height, shopName, templateId, activeShopLogo, livePrices, shopInfo, activeHallmarkLogo);

          resolve({
            dataUrl: canvas.toDataURL("image/png"),
            shopName,
            cardNum,
          });
        };
        img.onerror = () => resolve(null);
      } catch (e) {
        console.warn("Canvas preview error:", e);
        resolve(null);
      }
    });
  };

  const handleOpenImagePreview = async (btn) => {
    setIsPreviewLoading(true);
    const randomImageNumber = Math.floor(Math.random() * 50) + 1;
    let selectedAssetUrl = '';
    if (basicAssets.images && basicAssets.images.length > 0) {
      selectedAssetUrl = basicAssets.images[(btn.id - 1) % basicAssets.images.length];
    }
    const result = await generateImageCardDataUrl(btn.label, randomImageNumber, btn.id, selectedAssetUrl);

    if (result && result.dataUrl) {
      setPreviewData({
        type: "image",
        title: btn.label,
        subtitle: `Daily Rates Card - Template ${btn.id}`,
        previewUrl: result.dataUrl,
        cardNum: randomImageNumber,
        templateId: btn.id,
        shopName: result.shopName,
        item: btn,
      });
    }
    setIsPreviewLoading(false);
  };

  const handleOpenVideoPreview = (vid) => {
    const activeSubdomain = getTenantSubdomain();
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase() + " JEWELLERY";
    const shopName = (shopInfo?.name || defaultShopName).toUpperCase();

    const randomVideoNumber = Math.floor(Math.random() * 10) + 1;
    const randomFile = `aadagam${randomVideoNumber}.mp4`;

    setPreviewData({
      type: "video",
      title: vid.label,
      subtitle: `WhatsApp Status Reel - Template ${vid.id}`,
      previewUrl: `/status_videos/${randomFile}`,
      fileName: randomFile,
      videoNumber: randomVideoNumber,
      templateId: vid.id,
      shopName: shopName,
      item: vid,
    });
  };

  const triggerImageDownloadFromDataUrl = (dataUrl, label, cardNum, templateId = 1) => {
    const activeSubdomain = getTenantSubdomain();
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase() + " JEWELLERY";
    const shopName = (shopInfo?.name || defaultShopName).toUpperCase();
    const cleanName = shopName.toLowerCase().replace(/\s+/g, "_");

    const link = document.createElement("a");
    link.download = `${cleanName}_template${templateId}_${label.toLowerCase().replace(/\s+/g, "_")}_card_${cardNum}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase() + " JEWELLERY";
    const shopName = (shopInfo?.name || defaultShopName).toUpperCase();
    const cleanName = shopName.toLowerCase().replace(/\s+/g, "_");

    const videoPath = `/status_videos/${fileName || `aadagam${videoNumber}.mp4`}`;

    try {
      const video = document.createElement("video");
      video.src = videoPath;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      await new Promise((resolve, reject) => {
        video.onloadeddata = resolve;
        video.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext("2d");

      if (!ctx || !canvas.captureStream || typeof MediaRecorder === "undefined") {
        throw new Error("MediaRecorder not supported");
      }

      const stream = canvas.captureStream(30);
      let mimeType = "video/webm";
      if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
        mimeType = "video/mp4;codecs=avc1";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
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
          const ext = mimeType.includes("mp4") ? "mp4" : "webm";
          link.download = `${cleanName}_template${templateId}_whatsapp_video_${videoNumber}.${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          resolve();
        };
      });

      mediaRecorder.start();
      await video.play();

      let animId;
      const renderFrame = () => {
        if (video.paused || video.ended) {
          cancelAnimationFrame(animId);
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        drawStatusOverlay(ctx, canvas.width, canvas.height, shopName, templateId, loadedShopLogo, livePrices, shopInfo, loadedHallmarkLogo);
        animId = requestAnimationFrame(renderFrame);
      };

      renderFrame();
      await recordPromise;

      setDownloadingId(null);
      setSuccessInfo({
        title: `${label || `Status Video ${videoNumber}`} Downloaded!`,
        desc: `Template #${templateId} Video (${label}) for ${shopName} branded & saved!`,
        type: "video",
      });
    } catch (err) {
      console.warn("Video branding fallback to direct download:", err);
      const link = document.createElement("a");
      link.href = videoPath;
      link.download = `${cleanName}_template${templateId}_whatsapp_status_video_${videoNumber}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadingId(null);
      setSuccessInfo({
        title: `${label || `Status Video ${videoNumber}`} Downloaded!`,
        desc: `WhatsApp Status Video #${videoNumber} (${label}) downloaded successfully!`,
        type: "video",
      });
    }

    setTimeout(() => {
      setSuccessInfo((prev) => (prev?.title?.includes(`Status Video ${videoNumber}`) ? null : prev));
    }, 5000);
  };

  const handleVideoDownload = () => {
    const randomVideoNumber = Math.floor(Math.random() * 4) + 1;
    const target = statusVideos.find((v) => v.id === randomVideoNumber) || statusVideos[0];
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
            Choose from 4 elegant image templates and 4 video reel templates stamped with live gold & silver rates, official BIS 916 Hallmark logo, and your showroom emblem.
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
              HD Video Status Templates (4 Reel Styles)
            </span>
          </div>

          {/* Row 2: 4 Status Video Templates */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

          {/* Quick Action: Preview & Download Video */}
          <div className="pt-2">
            <button
              onClick={handleVideoDownload}
              className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold py-3.5 px-8 rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-900/15 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-200" />
              <span>Preview & Download Branded Video Reel</span>
            </button>
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
                  <img
                    src={previewData.previewUrl}
                    alt={previewData.title}
                    className="w-full h-full object-cover"
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
                    onClick={() => {
                      triggerImageDownloadFromDataUrl(previewData.previewUrl, previewData.title, previewData.cardNum, previewData.templateId);
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
