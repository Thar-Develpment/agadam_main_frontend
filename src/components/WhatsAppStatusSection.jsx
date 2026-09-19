import React, { useState, useEffect } from "react";
import { Download, Sparkles, Video, Image, CheckCircle2, Loader2, X, Play } from "lucide-react";
import { getSiteInfo, getBasicAssets } from "../services/api";
import { getTenantSubdomain, getShopPrefix } from "../services/apiClient";

function VideoCanvasPreview({ videoUrl, shopName, drawOverlay }) {
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
          drawOverlay(ctx, canvas.width, canvas.height, shopName);
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
  }, [videoUrl, shopName, drawOverlay]);

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

export default function WhatsAppStatusSection({ shopInfo }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [basicAssets, setBasicAssets] = useState({
    images: [], videos: [
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
      label: "Status Design - 1",
      theme: {
        bg: "bg-[#111111] hover:bg-black",
        border: "border-stone-800 hover:border-[#D4AF37]",
        shadow: "shadow-md shadow-black/25 hover:shadow-xl hover:shadow-black/40",
        iconWrapper: "bg-stone-900 border border-stone-700 text-[#25D366]",
        titleColor: "text-white font-serif",
        actionColor: "text-[#D4AF37] group-hover:text-[#F3E5AB]",
        accentDot: "bg-[#25D366]",
      },
    },
    {
      id: 2,
      label: "Status Design - 2",
      theme: {
        bg: "bg-[#B91C1C] hover:bg-[#991B1B]",
        border: "border-red-400/40 hover:border-white/80",
        shadow: "shadow-md shadow-red-950/25 hover:shadow-xl hover:shadow-red-900/40",
        iconWrapper: "bg-white/20 backdrop-blur-xs border border-white/40 text-white",
        titleColor: "text-white font-serif",
        actionColor: "text-rose-100 group-hover:text-white",
        accentDot: "bg-rose-200",
      },
    },
    {
      id: 3,
      label: "Status Design - 3",
      theme: {
        bg: "bg-[#3B49DF] hover:bg-[#2A37B8]",
        border: "border-blue-400/40 hover:border-white/80",
        shadow: "shadow-md shadow-blue-950/25 hover:shadow-xl hover:shadow-blue-900/40",
        iconWrapper: "bg-white/20 backdrop-blur-xs border border-white/40 text-white",
        titleColor: "text-white font-serif",
        actionColor: "text-blue-100 group-hover:text-white",
        accentDot: "bg-blue-200",
      },
    },
    {
      id: 4,
      label: "Status Design - 4",
      theme: {
        bg: "bg-[#6B21A8] hover:bg-[#581C87]",
        border: "border-purple-400/40 hover:border-white/80",
        shadow: "shadow-md shadow-purple-950/25 hover:shadow-xl hover:shadow-purple-900/40",
        iconWrapper: "bg-white/20 backdrop-blur-xs border border-white/40 text-white",
        titleColor: "text-white font-serif",
        actionColor: "text-purple-100 group-hover:text-white",
        accentDot: "bg-purple-200",
      },
    },
  ];

  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  /**
   * Generates a high-resolution 1080x1920 9:16 WhatsApp Status Card PNG
   * displaying Shop Name on top, Silver Price on bottom left, and Gold Price on bottom right.
   */
  const generateImageCardDataUrl = (label, cardNum, imageUrl = '') => {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");

        if (!ctx) return resolve(null);

        const getRandomImg = Math.floor(Math.random() * 30) + 1;

        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl || `/aadagam (${getRandomImg}).png`;

        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const activeSubdomain = getTenantSubdomain();
          const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase() + " JEWELLERY";
          const shopName = (shopInfo?.name || defaultShopName).toUpperCase();

          drawVideoBrandingOverlay(ctx, canvas.width, canvas.height, shopName);

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
    const result = await generateImageCardDataUrl(btn.label, randomImageNumber, selectedAssetUrl);

    if (result && result.dataUrl) {
      setPreviewData({
        type: "image",
        title: btn.label,
        subtitle: "Daily Live Rates Card",
        previewUrl: result.dataUrl,
        cardNum: randomImageNumber,
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
      subtitle: "WhatsApp Status Video",
      previewUrl: `/status_videos/${randomFile}`,
      fileName: randomFile,
      videoNumber: randomVideoNumber,
      shopName: shopName,
      item: vid,
    });
  };

  const triggerImageDownloadFromDataUrl = (dataUrl, label, cardNum) => {
    const activeSubdomain = getTenantSubdomain();
    const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase() + " JEWELLERY";
    const shopName = (shopInfo?.name || defaultShopName).toUpperCase();
    const cleanName = shopName.toLowerCase().replace(/\s+/g, "_");

    const link = document.createElement("a");
    link.download = `${cleanName}_${label.toLowerCase().replace(/\s+/g, "_")}_card_${cardNum}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessInfo({
      title: `${label} Downloaded Successfully!`,
      desc: `Daily Card #${cardNum} for ${shopName} saved with Live Gold & Silver rates!`,
      type: "image",
    });

    setTimeout(() => {
      setSuccessInfo((prev) => (prev?.title?.startsWith(label) ? null : prev));
    }, 5000);
  };

  const handleStatusDownload = (buttonId, buttonLabel) => {
    const btn = statusButtons.find((b) => b.id === buttonId) || { label: buttonLabel, desc: "Status Card" };
    handleOpenImagePreview(btn);
  };

  const statusVideos = [
    {
      id: 1,
      label: "Status Video - 1",
      theme: {
        bg: "bg-gradient-to-r from-[#D97706] via-[#FBBF24] to-[#D97706] hover:from-[#B45309] hover:via-[#F59E0B] hover:to-[#B45309]",
        border: "border-amber-300/80 hover:border-white",
        shadow: "shadow-md shadow-amber-950/25 hover:shadow-xl hover:shadow-amber-900/40",
        iconWrapper: "bg-stone-950/80 border border-stone-800 text-[#FCD34D]",
        titleColor: "text-stone-950 font-black",
        actionColor: "text-stone-900 font-bold group-hover:text-stone-950",
        accentDot: "bg-stone-950",
      },
    },
    {
      id: 2,
      label: "Status Video - 2",
      theme: {
        bg: "bg-[#BE123C] hover:bg-[#9F1239]",
        border: "border-pink-400/40 hover:border-white/80",
        shadow: "shadow-md shadow-pink-950/25 hover:shadow-xl hover:shadow-pink-900/40",
        iconWrapper: "bg-white/20 backdrop-blur-xs border border-white/40 text-white",
        titleColor: "text-white font-serif",
        actionColor: "text-pink-100 group-hover:text-white",
        accentDot: "bg-pink-200",
      },
    },
    {
      id: 3,
      label: "Status Video - 3",
      theme: {
        bg: "bg-[#C2410C] hover:bg-[#9A3412]",
        border: "border-orange-400/40 hover:border-white/80",
        shadow: "shadow-md shadow-orange-950/25 hover:shadow-xl hover:shadow-orange-900/40",
        iconWrapper: "bg-white/20 backdrop-blur-xs border border-white/40 text-white",
        titleColor: "text-white font-serif",
        actionColor: "text-orange-100 group-hover:text-white",
        accentDot: "bg-orange-200",
      },
    },
    {
      id: 4,
      label: "Status Video - 4",
      theme: {
        bg: "bg-[#EA580C] hover:bg-[#C2410C]",
        border: "border-amber-300/50 hover:border-white/80",
        shadow: "shadow-md shadow-amber-950/25 hover:shadow-xl hover:shadow-amber-900/40",
        iconWrapper: "bg-white/20 backdrop-blur-xs border border-white/40 text-white",
        titleColor: "text-white font-serif",
        actionColor: "text-amber-100 group-hover:text-white",
        accentDot: "bg-amber-200",
      },
    },
  ];

  const drawVideoBrandingOverlay = (ctx, canvasWidth, canvasHeight, shopName) => {
    ctx.save();

    // Scaling factors based on standard 1080x1920 reference resolution
    const scaleX = canvasWidth / 1080;
    const scaleY = canvasHeight / 1920;
    const scale = Math.min(scaleX, scaleY);

    const centerX = canvasWidth / 2;

    // 1. Static Luxury Brand Logo Emblem at Top Center
    const logoY = 130 * scaleY;
    const logoRadius = 48 * scale;

    ctx.fillStyle = "rgba(20, 18, 16, 0.88)";
    ctx.beginPath();
    ctx.arc(centerX, logoY, logoRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    ctx.strokeStyle = "rgba(243, 229, 171, 0.6)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(centerX, logoY, logoRadius - 6 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Diamond Logo Icon inside logo circle
    ctx.fillStyle = "#D4AF37";
    ctx.beginPath();
    ctx.moveTo(centerX, logoY - 24 * scale);
    ctx.lineTo(centerX + 24 * scale, logoY - 8 * scale);
    ctx.lineTo(centerX, logoY + 24 * scale);
    ctx.lineTo(centerX - 24 * scale, logoY - 8 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#FFF8DC";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX - 24 * scale, logoY - 8 * scale);
    ctx.lineTo(centerX + 24 * scale, logoY - 8 * scale);
    ctx.moveTo(centerX, logoY - 24 * scale);
    ctx.lineTo(centerX, logoY + 24 * scale);
    ctx.stroke();

    // 2. Showroom Brand Header at Top of Video
    ctx.fillStyle = "#D4AF37";
    ctx.font = `bold ${Math.round(48 * scale)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.fillText(shopName, centerX, 230 * scaleY);

    ctx.fillStyle = "#E7E5E4";
    ctx.font = `${Math.round(22 * scale)}px sans-serif`;
    ctx.fillText("EXCLUSIVE SHOWROOM COLLECTION", centerX, 280 * scaleY);

    // Decorative divider below header
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(centerX - 180 * scaleX, 320 * scaleY);
    ctx.lineTo(centerX + 180 * scaleX, 320 * scaleY);
    ctx.stroke();

    // 3. Middle Tagline & Contact Details
    ctx.fillStyle = "#FAF9F5";
    ctx.font = `${Math.round(28 * scale)}px sans-serif`;
    ctx.fillText("100% BIS Hallmarked 22K Gold & Certified Diamonds", centerX, canvasHeight - 540 * scaleY);

    ctx.fillStyle = "#E7E5E4";
    ctx.font = `${Math.round(24 * scale)}px sans-serif`;
    ctx.fillText("Visit our showroom or message us on WhatsApp for orders", centerX, canvasHeight - 480 * scaleY);

    ctx.fillStyle = "#D4AF37";
    ctx.font = `bold ${Math.round(34 * scale)}px sans-serif`;
    ctx.fillText(shopInfo?.phonePrimary || "+91 98765 43210", centerX, canvasHeight - 410 * scaleY);

    // 4. Bottom Left Corner: Silver Price Badge
    const silverX = 80 * scaleX;
    const badgeY = canvasHeight - 280 * scaleY;
    const badgeW = 380 * scaleX;
    const badgeH = 140 * scaleY;

    const silverGrad = ctx.createLinearGradient(silverX, badgeY, silverX + badgeW, badgeY + badgeH);
    silverGrad.addColorStop(0, "rgba(255, 253, 248, 0.94)");
    silverGrad.addColorStop(1, "rgba(242, 238, 226, 0.92)");
    ctx.fillStyle = silverGrad;
    ctx.beginPath();
    ctx.roundRect(silverX, badgeY, badgeW, badgeH, 20 * scale);
    ctx.fill();
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    ctx.fillStyle = "#57534E";
    ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("SILVER RATE (999)", silverX + badgeW / 2, badgeY + 45 * scaleY);

    ctx.fillStyle = "#1C1917";
    ctx.font = `bold ${Math.round(34 * scale)}px Georgia, serif`;
    ctx.fillText(`${livePrices.silver999} /g`, silverX + badgeW / 2, badgeY + 100 * scaleY);

    // 5. Bottom Right Corner: Gold Price Badge
    const goldX = canvasWidth - badgeW - 80 * scaleX;

    const goldGrad = ctx.createLinearGradient(goldX, badgeY, goldX + badgeW, badgeY + badgeH);
    goldGrad.addColorStop(0, "rgba(255, 251, 235, 0.94)");
    goldGrad.addColorStop(1, "rgba(254, 243, 199, 0.92)");
    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.roundRect(goldX, badgeY, badgeW, badgeH, 20 * scale);
    ctx.fill();
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 2.5 * scale;
    ctx.stroke();

    ctx.fillStyle = "#78350F";
    ctx.font = `bold ${Math.round(20 * scale)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("GOLD RATE (22K)", goldX + badgeW / 2, badgeY + 45 * scaleY);

    ctx.fillStyle = "#1C1917";
    ctx.font = `bold ${Math.round(34 * scale)}px Georgia, serif`;
    ctx.fillText(`${livePrices.gold22k} /g`, goldX + badgeW / 2, badgeY + 100 * scaleY);

    ctx.restore();
  };

  const handleVideoDownloadItem = async (videoNumber, label, fileName) => {
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
          link.download = `${cleanName}_whatsapp_status_video_${videoNumber}.${ext}`;
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
        drawVideoBrandingOverlay(ctx, canvas.width, canvas.height, shopName);
        animId = requestAnimationFrame(renderFrame);
      };

      renderFrame();
      await recordPromise;

      setDownloadingId(null);
      setSuccessInfo({
        title: `${label || `Status Video ${videoNumber}`} Branded & Downloaded!`,
        desc: `WhatsApp Status Video #${videoNumber} (${label}) with Live Rates & ${shopName} branding saved!`,
        type: "video",
      });
    } catch (err) {
      console.warn("Video branding fallback to direct download:", err);
      const link = document.createElement("a");
      link.href = videoPath;
      link.download = `${cleanName}_whatsapp_status_video_${videoNumber}.mp4`;
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
    const randomVideoNumber = Math.floor(Math.random() * 10) + 1;
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
            <span>WhatsApp Status & Media</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Share Our Collections on WhatsApp
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
            Preview & download daily high-resolution status cards stamped with live gold & silver rates or HD status videos for your showroom.
          </p>
        </div>

        {/* Action Container Card */}
        <div className="bg-white border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-xl max-w-4xl mx-auto space-y-8 relative">
          {/* Row 1: 4 Flex Buttons for Status Images */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest text-left">
                Daily WhatsApp Status Images (With Live Rates)
              </span>
              <span className="text-[10px] font-mono text-[#B8860B] bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/20">
                4 Unique Designs
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
                    {/* Top Right Decorative Corner Accent */}
                    <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${theme.accentDot} opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all`} />

                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${theme.iconWrapper} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300 shadow-sm`}>
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-current" />
                      ) : (
                        <Image className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </div>

                    <span className={`font-serif font-bold text-xs sm:text-sm tracking-wide block truncate ${theme.titleColor}`}>
                      {btn.label}
                    </span>

                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold font-mono transition-colors ${theme.actionColor}`}>
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>Preview & Save</span>
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
              Daily WhatsApp Status Videos (HD Reels)
            </span>
          </div>

          {/* Row 2: 4 Status Video Buttons Grid */}
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
                    {/* Top Right Decorative Corner Accent */}
                    <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${theme.accentDot} opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all`} />

                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${theme.iconWrapper} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300 shadow-sm`}>
                      <Video className="w-5 h-5" />
                    </div>

                    <span className={`font-serif font-bold text-xs sm:text-sm tracking-wide block truncate ${theme.titleColor}`}>
                      {vid.label}
                    </span>

                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold font-mono transition-colors ${theme.actionColor}`}>
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>Preview MP4</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action: Random Video Download */}
          <div className="pt-2">
            <button
              onClick={handleVideoDownload}
              className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold py-3.5 px-8 rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-emerald-900/15 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-200" />
              <span>Preview & Download WhatsApp Status Video</span>
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
                    drawOverlay={drawVideoBrandingOverlay}
                  />
                )}
              </div>
              <span className="text-[11px] text-stone-400 font-mono mt-2">
                9:16 HD WhatsApp Status Format
              </span>
            </div>

            {/* Right: Info & Download Actions */}
            <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>WhatsApp Status Preview</span>
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
                    <span className="text-stone-400">Live Gold Rate (22K):</span>
                    <span className="font-bold text-amber-300">{livePrices.gold22k} /g</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">Live Silver Rate (999):</span>
                    <span className="font-bold text-stone-200">{livePrices.silver999} /g</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                  Stamped with 100% BIS Hallmarked guarantee, live metal rates, and your showroom phone number ready to share on WhatsApp Status.
                </p>
              </div>

              {/* Download & Close Actions */}
              <div className="space-y-3 pt-2">
                {previewData.type === "image" ? (
                  <button
                    onClick={() => {
                      triggerImageDownloadFromDataUrl(previewData.previewUrl, previewData.title, previewData.cardNum);
                      setPreviewData(null);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-stone-950 font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-stone-950" />
                    <span>Download Image Status Card</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleVideoDownloadItem(previewData.videoNumber, previewData.title, previewData.fileName);
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
                        <span>Download Branded Status Video</span>
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
