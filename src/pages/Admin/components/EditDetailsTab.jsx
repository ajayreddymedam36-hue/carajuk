import { useEffect, useState, useRef } from "react";
import { supabase } from "@/services/supabase/client";
import { sendEmail } from "@/services/email/emailService";

export default function EditDetailsTab() {
  // Contact Details State
  const [phone, setPhone] = useState("+91 94946 66632");
  const [address, setAddress] = useState("Opposite Minority Welfare School, Shyampet, Hanamkonda, Telangana — 506001");
  const [email, setEmail] = useState("carajuk@gmail.com");
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsMsg, setDetailsMsg] = useState("");

  // Change Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  // Gallery Management State
  const [gallery, setGallery] = useState([]);
  const [newPhoto, setNewPhoto] = useState({ url: "", title: "", desc: "" });
  const [savingGallery, setSavingGallery] = useState(false);
  const [galleryMsg, setGalleryMsg] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  
  // AI Helper State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Cropper State
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!cropImageSrc) return;
    const img = new Image();
    img.src = cropImageSrc;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [cropImageSrc]);

  useEffect(() => {
    if (imageRef.current) {
      drawCanvas();
    }
  }, [zoom, pan]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight;

    if (imgRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
    }

    const w = drawWidth * zoom;
    const h = drawHeight * zoom;

    const x = (canvas.width - w) / 2 + pan.x;
    const y = (canvas.height - h) / 2 + pan.y;

    ctx.drawImage(img, x, y, w, h);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: pan.x, y: pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPan({ x: dragOffset.x + dx, y: dragOffset.y + dy });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setDragOffset({ x: pan.x, y: pan.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;
    setPan({ x: dragOffset.x + dx, y: dragOffset.y + dy });
  };

  const applyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const croppedDataURL = canvas.toDataURL("image/jpeg", 0.9);
    setNewPhoto((prev) => ({ ...prev, url: croppedDataURL }));
    setCropImageSrc("");
  };

  // OTP Verification State
  const [adminEmail, setAdminEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpActionType, setOtpActionType] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Get currently logged-in administrator email
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        setAdminEmail(userData.user.email);
      }

      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item.key === "phone") setPhone(item.value);
          if (item.key === "address") setAddress(item.value);
          if (item.key === "email") setEmail(item.value);
          if (item.key === "gallery") {
            try {
              setGallery(JSON.parse(item.value));
            } catch (e) {
              console.error("Failed to parse gallery from settings key:", e);
            }
          }
        });
      }
    } catch (err) {
      console.warn("Failed to load settings from Supabase table. Using defaults or local storage.", err);
      // Try local storage fallback
      const savedPhone = localStorage.getItem("firm_phone");
      const savedAddress = localStorage.getItem("firm_address");
      const savedEmail = localStorage.getItem("firm_email");
      const savedGallery = localStorage.getItem("firm_gallery");
      if (savedPhone) setPhone(savedPhone);
      if (savedAddress) setAddress(savedAddress);
      if (savedEmail) setEmail(savedEmail);
      if (savedGallery) {
        try {
          setGallery(JSON.parse(savedGallery));
        } catch (e) {
          console.error(e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save Contact Details - Sends OTP code first
  const saveSettings = async (e) => {
    e.preventDefault();
    if (!adminEmail) {
      alert("Error: Logged-in admin email not found. Please log in again.");
      return;
    }
    
    setSendingOtp(true);
    setDetailsMsg("");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpActionType("details");

    try {
      await sendEmail({
        to_name: "Admin",
        name: "Admin",
        to_email: adminEmail,
        email: adminEmail,
        subject: "Security Verification Code — Edit Contact Details",
        message: `Hello Admin,\n\nA request has been made to edit the contact details on the CA Raju Koyyala & Associates website.\n\nYour one-time confirmation code is: ${otp}\n\nIf you did not initiate this request, please ignore this email or change your password.`,
      });
      setShowOtpModal(true);
    } catch (err) {
      alert(`Failed to send verification code to your email: ${err.message}`);
    } finally {
      setSendingOtp(false);
    }
  };

  // Perform actual details or password update after valid OTP input
  const confirmSaveSettings = async (e) => {
    e.preventDefault();
    if (otpInput.trim() !== generatedOtp) {
      alert("Invalid verification code. Please check your email and try again.");
      return;
    }

    setShowOtpModal(false);
    setOtpInput("");

    if (otpActionType === "password") {
      setChangingPassword(true);
      setPwMsg("");
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setPwMsg("✓ Password updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err) {
        setPwMsg(`Error: ${err.message}`);
      } finally {
        setChangingPassword(false);
      }
    } else {
      setSavingDetails(true);
      setDetailsMsg("");

      try {
        const { error } = await supabase.from("settings").upsert([
          { key: "phone", value: phone.trim() },
          { key: "address", value: address.trim() },
          { key: "email", value: email.trim() },
        ]);

        if (error) throw error;
        setDetailsMsg("✓ Contact details saved successfully.");
      } catch (err) {
        console.warn("Could not save to Supabase table. Saving to Local Storage instead.", err);
        setDetailsMsg("✓ Saved locally. (Run settings migration to enable database syncing.)");
      } finally {
        localStorage.setItem("firm_phone", phone.trim());
        localStorage.setItem("firm_address", address.trim());
        localStorage.setItem("firm_email", email.trim());
        setSavingDetails(false);
      }
    }
  };

  // Change Password Action - Sends OTP code first
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg("");
    if (newPassword !== confirmPassword) {
      setPwMsg("Error: Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg("Error: Password must be at least 6 characters long.");
      return;
    }
    if (!adminEmail) {
      alert("Error: Logged-in admin email not found. Please log in again.");
      return;
    }

    setSendingOtp(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setOtpActionType("password");

    try {
      await sendEmail({
        to_name: "Admin",
        name: "Admin",
        to_email: adminEmail,
        email: adminEmail,
        subject: "Security Verification Code — Change Password",
        message: `Hello Admin,\n\nA request has been made to change the password on the CA Raju Koyyala & Associates website.\n\nYour one-time confirmation code is: ${otp}\n\nIf you did not initiate this request, please ignore this email.`,
      });
      setShowOtpModal(true);
    } catch (err) {
      setPwMsg(`Error sending verification code: ${err.message}`);
    } finally {
      setSendingOtp(false);
    }
  };

  // Gallery File Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // AI Autofill handler
  const handleAIFill = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      alert("Please enter a short description for the AI first.");
      return;
    }
    setAiLoading(true);
    try {
      const detailedPrompt = `You are a professional copywriter for a premium chartered accountant firm, 'CA Raju Koyyala & Associates'.
Given a short, informal description of a photo or achievement, write a polished, corporate-standard Title (3-5 words maximum) and a professional Description (12-20 words maximum) suitable for the website's gallery section.

Input description: "${aiPrompt.trim()}"

You must respond STRICTLY with a response containing a valid JSON object matching the following structure:
{
  "title": "Corporate Title Here",
  "description": "Professional description explaining the picture or achievement here."
}`;

      const { data, error } = await supabase.functions.invoke("dynamic-endpoint", {
        body: { prompt: detailedPrompt, message: detailedPrompt }
      });

      if (error) throw error;

      let text = "";
      if (data) {
        if (typeof data === "string") text = data;
        else if (typeof data === "object") {
          text = data.text || data.message || data.generatedText || data.reply || "";
        }
      }

      text = text.trim();
      if (text.startsWith("```json")) {
        text = text.substring(7, text.length - 3).trim();
      } else if (text.startsWith("```")) {
        text = text.substring(3, text.length - 3).trim();
      }

      const parsed = JSON.parse(text);
      setNewPhoto((prev) => ({
        ...prev,
        title: parsed.title || "Milestone Achieved",
        desc: parsed.description || aiPrompt.trim()
      }));
      setAiPrompt("");
    } catch (err) {
      console.error(err);
      let errorMsg = err.message;
      if (err.context && typeof err.context.text === "function") {
        try {
          const bodyText = await err.context.text();
          const parsed = JSON.parse(bodyText);
          errorMsg = parsed.error || parsed.message || bodyText;
        } catch (_) {}
      }
      alert(`AI generation failed: ${errorMsg}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Add/Edit Photo in Local State
  const addPhotoToGallery = (e) => {
    e.preventDefault();
    if (!newPhoto.url) {
      alert("Please select or upload a photo first.");
      return;
    }
    
    if (editingIndex !== null) {
      setGallery((prev) => {
        const updated = [...prev];
        updated[editingIndex] = { ...newPhoto };
        return updated;
      });
      setEditingIndex(null);
    } else {
      setGallery((prev) => [...prev, { ...newPhoto }]);
    }
    
    setNewPhoto({ url: "", title: "", desc: "" });
    // Reset file input
    const fileInput = document.getElementById("gallery-file-input");
    if (fileInput) fileInput.value = "";
  };

  const startEditPhoto = (img, index) => {
    setNewPhoto({ url: img.url, title: img.title, desc: img.desc });
    setEditingIndex(index);
    setCropImageSrc(""); // Clear crop source since we load pre-cropped image
    
    const formElement = document.getElementById("add-photo-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Remove Photo from Local State
  const removePhoto = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  // Move Photo Up or Down in Order
  const movePhoto = (index, direction) => {
    setGallery((prev) => {
      const updated = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
  };

  // Drag-and-Drop reorder
  const dragItem = { current: null };
  const dragOverItem = { current: null };

  const handleDragStart = (idx) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) return;
    setGallery((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Save Gallery to Database
  const saveGalleryToDB = async () => {
    setSavingGallery(true);
    setGalleryMsg("");

    try {
      const { error } = await supabase.from("settings").upsert([
        { key: "gallery", value: JSON.stringify(gallery) },
      ]);

      if (error) throw error;
      setGalleryMsg("✓ Gallery saved successfully to Database.");
    } catch (err) {
      console.warn("Could not save gallery to Supabase table. Saving to Local Storage.", err);
      setGalleryMsg("✓ Saved locally. (Run settings migration to enable database syncing.)");
    } finally {
      try {
        localStorage.setItem("firm_gallery", JSON.stringify(gallery));
      } catch (err) {
        console.error("Local Storage quota exceeded when saving gallery:", err);
      }
      setSavingGallery(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem", color: "var(--muted)" }}>Loading portal details…</div>;
  }

  return (
    <div className="anim-fade-up ed-wrapper" style={{ display: "grid", gap: "2.5rem", maxWidth: 800 }}>
      {/* 1. Edit Contact Details */}
      <div>
        <h1 className="font-serif" style={{ fontSize: "1.9rem", marginBottom: ".3rem" }}>
          Edit Contact Details
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "1.2rem" }}>
          Modify your phone number, office address and email shown on the website.
        </p>

        <form onSubmit={saveSettings} className="card ed-card" style={{ padding: "1.8rem", display: "grid", gap: "1rem" }}>
          <div className="field">
            <label className="label">Mobile Number</label>
            <input
              className="input"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 94946 66632"
            />
          </div>

          <div className="field">
            <label className="label">Office Address</label>
            <input
              className="input"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Opposite Minority Welfare School, Shyampet, Hanamkonda, Telangana — 506001"
            />
          </div>

          <div className="field">
            <label className="label">Gmail / Contact Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="carajuk@gmail.com"
            />
          </div>

          {detailsMsg && (
            <div
              style={{
                padding: ".7rem .9rem",
                background: detailsMsg.includes("Error") ? "#FEE2E2" : "#D1FAE5",
                color: detailsMsg.includes("Error") ? "#991B1B" : "#065F46",
                borderRadius: 8,
                fontSize: ".88rem",
                fontWeight: 500,
              }}
            >
              {detailsMsg}
            </div>
          )}

          <button type="submit" className="btn btn-gold" disabled={savingDetails || sendingOtp}>
            {sendingOtp ? "Sending code..." : savingDetails ? "Saving Changes…" : "Save Contact Details"}
          </button>
        </form>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)" }} />

      {/* 2. Gallery Management */}
      <div>
        <h2 className="font-serif" style={{ fontSize: "1.6rem", marginBottom: ".3rem" }}>
          Manage Homepage Gallery
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "1.2rem" }}>
          Upload photos and write custom titles/descriptions to display on the public homepage gallery section.
        </p>

        <div className="card ed-card" style={{ padding: "1.8rem", display: "grid", gap: "1.5rem" }}>
          {/* Add New Photo Form */}
          <form id="add-photo-form" onSubmit={addPhotoToGallery} style={{ display: "grid", gap: "1rem", borderBottom: "1px dashed var(--line)", paddingBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)", margin: 0 }}>
              {editingIndex !== null ? "Edit Image Details" : "Add New Image"}
            </h3>
            
            {/* AI Generator Helper */}
            <div style={{ background: "rgba(212,175,55,0.08)", border: "1px dashed rgba(212,175,55,0.4)", borderRadius: 10, padding: "1rem", display: "grid", gap: "0.8rem" }}>
              <div style={{ fontWeight: 600, color: "var(--gold-dark)", fontSize: "0.9rem" }}>✨ Auto-fill Title &amp; Description with AI</div>
              <div className="ed-ai-row" style={{ display: "flex", gap: "0.5rem" }}>
                <input 
                  className="input" 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. got a award from ICAI President at Hyderabad" 
                  style={{ background: "#fff" }}
                />
                <button 
                  type="button" 
                  onClick={handleAIFill} 
                  disabled={aiLoading}
                  className="btn btn-gold" 
                  style={{ padding: "0 1.2rem", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {aiLoading ? "Thinking..." : "Generate AI"}
                </button>
              </div>
            </div>
            
            <div className="field">
              <label className="label">Select Photo</label>
              <input 
                id="gallery-file-input"
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="input"
                style={{ padding: "0.5rem" }}
              />
            </div>

            {cropImageSrc && (
              <div style={{ 
                background: "var(--canvas-3)", 
                padding: "1.2rem", 
                borderRadius: 12, 
                border: "1.5px dashed var(--gold)", 
                display: "grid", 
                gap: "1rem", 
                justifyItems: "center" 
              }}>
                <div style={{ width: "100%", textAlign: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--navy)" }}> Crop Your Image </span>
                  <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "0.2rem 0 0.8rem" }}>
                    Drag the image inside the frame to pan, and use the slider below to zoom.
                  </p>
                </div>
                
                <div style={{ 
                  position: "relative", 
                  width: "360px", 
                  height: "270px", 
                  overflow: "hidden", 
                  borderRadius: 8, 
                  border: "2px solid var(--navy)",
                  background: "#000",
                  cursor: isDragging ? "grabbing" : "grab"
                }}>
                  <canvas
                    ref={canvasRef}
                    width={360}
                    height={270}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUpOrLeave}
                    style={{ display: "block", width: "100%", height: "100%" }}
                  />
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: "none",
                    border: "2px solid rgba(212, 175, 55, 0.4)",
                    boxShadow: "inset 0 0 40px rgba(0,0,0,0.3)"
                  }} />
                </div>

                <div style={{ width: "100%", display: "grid", gap: "0.4rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 600 }}>
                    <span>Zoom: {zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--gold)" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                  <button 
                    type="button" 
                    onClick={applyCrop} 
                    className="btn btn-gold" 
                    style={{ flex: 1, padding: "0.5rem" }}
                  >
                    Apply Crop
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCropImageSrc("");
                      const fileInput = document.getElementById("gallery-file-input");
                      if (fileInput) fileInput.value = "";
                    }} 
                    className="btn" 
                    style={{ flex: 1, padding: "0.5rem", border: "1px solid var(--line)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {newPhoto.url && !cropImageSrc && (
              <div style={{ textAlign: "center" }}>
                <img 
                  src={newPhoto.url} 
                  alt="Preview" 
                  style={{ maxHeight: "150px", borderRadius: 8, border: "1px solid var(--line)", objectFit: "cover" }} 
                />
              </div>
            )}

            <div className="field">
              <label className="label">Image Title</label>
              <input 
                className="input"
                value={newPhoto.title}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Annual Audit Review"
                required
              />
            </div>

            <div className="field">
              <label className="label">Image Description</label>
              <input 
                className="input"
                value={newPhoto.desc}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, desc: e.target.value }))}
                placeholder="e.g. Explaining compliance updates to corporate clients."
                required
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="btn btn-outline" style={{ padding: "0.6rem 1.2rem" }}>
                {editingIndex !== null ? "✓ Update Image" : "+ Add to List"}
              </button>
              {editingIndex !== null && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingIndex(null);
                    setNewPhoto({ url: "", title: "", desc: "" });
                    const fileInput = document.getElementById("gallery-file-input");
                    if (fileInput) fileInput.value = "";
                  }} 
                  className="btn" 
                  style={{ padding: "0.6rem 1.2rem", border: "1px solid var(--line)" }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* Current Gallery List */}
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)", marginBottom: "0.3rem" }}>
              Current Gallery Images ({gallery.length})
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "1rem" }}>
              Drag ⠿ to reorder, or use ↑ ↓ arrows. Order shown here is the order shown on the website.
            </p>
            
            {gallery.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)", background: "var(--canvas-3)", borderRadius: 8 }}>
                No custom images uploaded yet. Homepage will display the three default workspace images.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {gallery.map((img, idx) => (
                  <div 
                    key={idx}
                    draggable
                    className="ed-gallery-row"
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "28px 80px 1fr auto", 
                      gap: "0.8rem", 
                      alignItems: "center", 
                      padding: "0.8rem", 
                      background: "var(--canvas-3)", 
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                      cursor: "grab",
                      transition: "box-shadow 0.15s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    {/* Drag Handle */}
                    <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "1.2rem", userSelect: "none", cursor: "grab" }} title="Drag to reorder">
                      ⠿
                    </div>

                    <img 
                      src={img.url} 
                      alt="" 
                      style={{ width: "80px", height: "60px", objectFit: "cover", borderRadius: 6 }} 
                    />

                    {/* Title, Desc & Position Badge */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "var(--gold)", color: "#fff", borderRadius: "100px", padding: "0.1rem 0.5rem" }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: "0.95rem" }}>{img.title}</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: "0.15rem" }}>{img.desc}</div>
                    </div>

                    {/* Action Buttons: Up / Down / Delete */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "flex-end" }}>
                      <div style={{ display: "flex", gap: "0.3rem" }}>
                        <button
                          type="button"
                          onClick={() => movePhoto(idx, -1)}
                          disabled={idx === 0}
                          title="Move Up"
                          style={{ 
                            background: idx === 0 ? "var(--canvas-3)" : "var(--navy)", 
                            color: idx === 0 ? "var(--muted)" : "#fff", 
                            border: "1px solid var(--line)", 
                            borderRadius: 6, 
                            padding: "0.3rem 0.6rem", 
                            fontSize: "0.85rem",
                            cursor: idx === 0 ? "not-allowed" : "pointer",
                            lineHeight: 1,
                          }}
                        >↑</button>
                        <button
                          type="button"
                          onClick={() => movePhoto(idx, 1)}
                          disabled={idx === gallery.length - 1}
                          title="Move Down"
                          style={{ 
                            background: idx === gallery.length - 1 ? "var(--canvas-3)" : "var(--navy)", 
                            color: idx === gallery.length - 1 ? "var(--muted)" : "#fff", 
                            border: "1px solid var(--line)", 
                            borderRadius: 6, 
                            padding: "0.3rem 0.6rem", 
                            fontSize: "0.85rem",
                            cursor: idx === gallery.length - 1 ? "not-allowed" : "pointer",
                            lineHeight: 1,
                          }}
                        >↓</button>
                      </div>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button 
                          type="button"
                          onClick={() => startEditPhoto(img, idx)} 
                          style={{ background: "#FEF3C7", color: "#D97706", border: "none", padding: "0.3rem 0.7rem", fontSize: "0.8rem", borderRadius: 6, cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        <button 
                          type="button"
                          onClick={() => removePhoto(idx)} 
                          style={{ background: "#FEE2E2", color: "#B91C1C", border: "none", padding: "0.3rem 0.7rem", fontSize: "0.8rem", borderRadius: 6, cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {galleryMsg && (
            <div
              style={{
                padding: ".7rem .9rem",
                background: galleryMsg.includes("Error") ? "#FEE2E2" : "#D1FAE5",
                color: galleryMsg.includes("Error") ? "#991B1B" : "#065F46",
                borderRadius: 8,
                fontSize: ".88rem",
                fontWeight: 500,
              }}
            >
              {galleryMsg}
            </div>
          )}

          <button onClick={saveGalleryToDB} className="btn btn-gold" disabled={savingGallery}>
            {savingGallery ? "Saving Gallery…" : "Save Gallery Layout"}
          </button>
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)" }} />

      {/* 3. Change Password */}
      <div>
        <h2 className="font-serif" style={{ fontSize: "1.6rem", marginBottom: ".3rem" }}>
          Change Account Password
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "1.2rem" }}>
          Update your password for internal administrator CRM access.
        </p>

        <form onSubmit={handlePasswordChange} className="card ed-card" style={{ padding: "1.8rem", display: "grid", gap: "1rem" }}>
          <div className="field">
            <label className="label">New Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="field">
            <label className="label">Confirm New Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {pwMsg && (
            <div
              style={{
                padding: ".7rem .9rem",
                background: pwMsg.startsWith("Error") ? "#FEE2E2" : "#D1FAE5",
                color: pwMsg.startsWith("Error") ? "#991B1B" : "#065F46",
                borderRadius: 8,
                fontSize: ".88rem",
                fontWeight: 500,
              }}
            >
              {pwMsg}
            </div>
          )}

          <button type="submit" className="btn btn-gold" disabled={changingPassword || sendingOtp}>
            {sendingOtp && otpActionType === "password" ? "Sending code..." : changingPassword ? "Updating Password…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div className="card anim-fade-up" style={{
            background: "#fff",
            maxWidth: "400px",
            width: "100%",
            padding: "2rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            display: "grid",
            gap: "1.2rem",
            border: "1px solid var(--line)"
          }}>
            <div>
              <h3 className="font-serif" style={{ fontSize: "1.4rem", color: "var(--navy)", margin: 0, marginBottom: "0.4rem" }}>
                {otpActionType === "password" ? "Verify Password Change" : "Verify Edit Details"}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--muted)", margin: 0 }}>
                We have sent a 6-digit confirmation code to your administrator email:
              </p>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy)", marginTop: "0.3rem", wordBreak: "break-all" }}>
                {adminEmail}
              </div>
            </div>

            <form onSubmit={confirmSaveSettings} style={{ display: "grid", gap: "1rem" }}>
              <div className="field">
                <label className="label" style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  className="input"
                  style={{
                    textAlign: "center",
                    fontSize: "1.4rem",
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    padding: "0.6rem"
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "0.8rem", marginTop: "0.4rem" }}>
                <button
                  type="button"
                  onClick={() => { setShowOtpModal(false); setOtpInput(""); }}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: "0.7rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ flex: 1, padding: "0.7rem" }}
                >
                  Confirm &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mobile responsive styles ── */}
      <style>{`
        @media (max-width: 640px) {
          .ed-wrapper {
            gap: 1.8rem !important;
          }
          .ed-wrapper h1 {
            font-size: 1.5rem !important;
          }
          .ed-wrapper h2 {
            font-size: 1.3rem !important;
          }
          .ed-wrapper h3 {
            font-size: 1rem !important;
          }
          .ed-wrapper p {
            font-size: 0.88rem !important;
          }
          .ed-card {
            padding: 1rem !important;
          }
          .ed-ai-row {
            flex-direction: column !important;
          }
          .ed-ai-row input {
            width: 100% !important;
          }
          .ed-ai-row button {
            width: 100% !important;
            padding: 0.6rem 1rem !important;
          }
          .ed-gallery-row {
            grid-template-columns: 24px 60px 1fr !important;
            grid-template-rows: auto auto !important;
          }
          .ed-gallery-row > div:last-child {
            grid-column: 1 / -1 !important;
            flex-direction: row !important;
            justify-content: flex-end !important;
          }
          .ed-gallery-row img {
            width: 60px !important;
            height: 48px !important;
          }
        }
      `}</style>
    </div>
  );
}
