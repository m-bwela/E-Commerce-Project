import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfileAPI, changePasswordAPI, deleteAccountAPI } from "@/api/auth";
import toast from "react-hot-toast";
import { fetchCurrentUser, logoutUser } from "@/store/authSlice";
import { useNavigate } from "react-router-dom";

const tabs = [
  { id: "view", label: "My Profile", icon: "👤" },
  { id: "edit", label: "Edit Profile", icon: "✏️" },
  { id: "avatar", label: "Avatar", icon: "🖼️" },
  { id: "password", label: "Password", icon: "🔒" },
  { id: "delete", label: "Delete Account", icon: "⚠️" },
];

export default function ProfileManagement() {
  // ── All hooks FIRST — React requires this ─────────────────────────────
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.auth.user);

  const [activeTab, setActiveTab] = useState("view");
  const [editForm, setEditForm] = useState({
    name:     reduxUser?.fullName || "",
    email:    reduxUser?.email    || "",
    phone:    reduxUser?.phone    || "",
    location: reduxUser?.location || "",
    bio:      reduxUser?.bio      || "",
    image:    null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const fileRef = useRef();

  // ── Derived values ─────────────────────────────────────────────────────
  const avatarSrc = avatarPreview || (reduxUser?.avatar ? `${reduxUser.avatar}` : null);
  const initials = (reduxUser?.fullName || "?").split(" ").map(n => n[0]).join("").toUpperCase();

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    const fd = new FormData();
    fd.append("fullName", editForm.name);
    fd.append("email",    editForm.email);
    fd.append("phone",    editForm.phone);
    fd.append("location", editForm.location);
    fd.append("bio",      editForm.bio);
    if (editForm.image) fd.append("avatar", editForm.image);
    try {
      await updateProfileAPI(fd);
      await dispatch(fetchCurrentUser());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleAvatarFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.current) return setPwdMsg({ type: "error", text: "Enter your current password." });
    if (passwordForm.newPass.length < 8) return setPwdMsg({ type: "error", text: "New password must be at least 8 characters." });
    if (passwordForm.newPass !== passwordForm.confirm) return setPwdMsg({ type: "error", text: "Passwords do not match." });
    try {
      await changePasswordAPI({ currentPassword: passwordForm.current, newPassword: passwordForm.newPass });
      setPwdMsg({ type: "success", text: "Password updated successfully!" });
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setPwdMsg(null), 3000);
    } catch (err) {
      setPwdMsg({ type: "error", text: err.response?.data?.message || "Failed to update password." });
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #12111a 50%, #0f0e18 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e8e4f0",
      padding: "0",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1a1824; }
        ::-webkit-scrollbar-thumb { background: #c9a84c55; border-radius: 3px; }
        .tab-btn { transition: all 0.25s ease; cursor: pointer; border: none; background: none; }
        .tab-btn:hover .tab-icon { transform: scale(1.15); }
        .gold-btn {
          background: linear-gradient(135deg, #c9a84c, #e8c96a, #b8922a);
          color: #1a1400;
          border: none;
          border-radius: 12px;
          padding: 13px 32px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px #c9a84c44;
        }
        .gold-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px #c9a84c66; }
        .ghost-btn {
          background: transparent;
          color: #9b96b0;
          border: 1.5px solid #2e2b3e;
          border-radius: 12px;
          padding: 13px 28px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .ghost-btn:hover { border-color: #c9a84c55; color: #c9a84c; }
        .input-field {
          width: 100%;
          background: #16141f;
          border: 1.5px solid #2a2740;
          border-radius: 12px;
          padding: 14px 18px;
          color: #e8e4f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: all 0.25s ease;
        }
        .input-field:focus { border-color: #c9a84c77; box-shadow: 0 0 0 3px #c9a84c18; }
        .input-field::placeholder { color: #4a4660; }
        .card {
          background: linear-gradient(145deg, #18162299, #13111c99);
          border: 1px solid #2a2740;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .stat-card {
          background: linear-gradient(145deg, #1e1b2e, #171525);
          border: 1px solid #2a2740;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }
        .stat-card:hover { border-color: #c9a84c44; transform: translateY(-3px); }
        .avatar-ring {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c9a84c, #e8c96a, #b8922a);
          padding: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #1e1b2e;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: #c9a84c;
        }
        .drop-zone {
          border: 2px dashed #2a2740;
          border-radius: 20px;
          padding: 50px 30px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .drop-zone.active { border-color: #c9a84c; background: #c9a84c0a; }
        .drop-zone:hover { border-color: #c9a84c55; background: #c9a84c05; }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slideIn 0.35s ease forwards; }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 #c9a84c33; }
          50% { box-shadow: 0 0 0 8px #c9a84c00; }
        }
        .pwd-toggle { background: none; border: none; cursor: pointer; color: #5a5575; transition: color 0.2s; padding: 0 4px; }
        .pwd-toggle:hover { color: #c9a84c; }
        .delete-input {
          width: 100%;
          background: #1a0f0f;
          border: 1.5px solid #3a1a1a;
          border-radius: 12px;
          padding: 14px 18px;
          color: #e8e4f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: all 0.25s ease;
        }
        .delete-input:focus { border-color: #e05555; box-shadow: 0 0 0 3px #e0555518; }
        .delete-input::placeholder { color: #4a3030; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: "#c9a84c", fontSize: 13, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
            ✦ Account Settings
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 700, color: "#f0ecff", lineHeight: 1.1 }}>
            Profile Management
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start" }}>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 24 }}>
            {/* Profile Snapshot */}
            <div className="card" style={{ padding: "28px 20px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <div className="avatar-ring">
                  <div className="avatar-inner">
                    {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: "#f0ecff", marginBottom: 4 }}>{reduxUser?.name}</p>
              <p style={{ color: "#5a5575", fontSize: 13, marginBottom: 10 }}>{reduxUser?.email}</p>
              <span className="badge" style={{ background: "#c9a84c18", color: "#c9a84c", border: "1px solid #c9a84c33" }}>⭐ Premium Member</span>
            </div>

            {/* Nav Tabs */}
            <div className="card" style={{ padding: 10 }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 16px",
                    borderRadius: 12,
                    background: activeTab === tab.id
                      ? tab.id === "delete" ? "linear-gradient(135deg, #2a0e0e, #1f0a0a)" : "linear-gradient(135deg, #c9a84c18, #e8c96a0a)"
                      : "transparent",
                    border: activeTab === tab.id
                      ? tab.id === "delete" ? "1px solid #5a1a1a" : "1px solid #c9a84c33"
                      : "1px solid transparent",
                    color: activeTab === tab.id
                      ? tab.id === "delete" ? "#e05555" : "#c9a84c"
                      : tab.id === "delete" ? "#7a4040" : "#6b6580",
                    marginBottom: 4,
                    textAlign: "left",
                  }}
                >
                  <span className="tab-icon" style={{ fontSize: 18, transition: "transform 0.2s" }}>{tab.icon}</span>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.6 }}>●</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="slide-in" key={activeTab}>

            {/* VIEW PROFILE */}
            {activeTab === "view" && (
              <div>
                <div className="card" style={{ padding: 36, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 28, marginBottom: 32 }}>
                    <div className="avatar-ring" style={{ width: 90, height: 90, flexShrink: 0 }}>
                      <div className="avatar-inner" style={{ fontSize: 26 }}>
                        {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                      </div>
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#f0ecff", marginBottom: 6 }}>{reduxUser?.fullName}</h2>
                      <p style={{ color: "#6b6580", fontSize: 14, marginBottom: 10 }}>📍 {reduxUser?.location || "—"} &nbsp;·&nbsp; Member since {reduxUser?.createdAt ? new Date(reduxUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</p>
                      <p style={{ color: "#9b96b0", fontSize: 14, lineHeight: 1.7, maxWidth: 460 }}>{reduxUser?.bio}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 32 }}>
                    {[
                      { label: "Total Orders", val: reduxUser?.orders?.length ?? 0, icon: "🛍️" },
                      { label: "Wishlist Items", val: 0, icon: "❤️" },
                      { label: "Reviews Left", val: 0, icon: "⭐" },
                    ].map(s => (
                      <div key={s.label} className="stat-card">
                        <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#c9a84c", marginBottom: 4 }}>{s.val}</div>
                        <div style={{ color: "#5a5575", fontSize: 12, fontWeight: 500, letterSpacing: 0.5 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Info Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      { label: "Full Name", val: reduxUser?.fullName, icon: "👤" },
                      { label: "Email Address", val: reduxUser?.email, icon: "📧" },
                      { label: "Phone Number", val: reduxUser?.phone || "—", icon: "📱" },
                      { label: "Location", val: reduxUser?.location || "—", icon: "📍" },
                    ].map(f => (
                      <div key={f.label} style={{ padding: "18px 20px", background: "#16141f", borderRadius: 14, border: "1px solid #2a2740" }}>
                        <p style={{ color: "#5a5575", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{f.icon} {f.label}</p>
                        <p style={{ color: "#d8d4e8", fontSize: 15, fontWeight: 500 }}>{f.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EDIT PROFILE */}
            {activeTab === "edit" && (
              <div className="card" style={{ padding: 36 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0ecff", marginBottom: 6 }}>Edit Profile</h2>
                <p style={{ color: "#5a5575", fontSize: 14, marginBottom: 30 }}>Update your personal information below.</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                  <div>
                    <label style={{ display: "block", color: "#7a7590", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Full Name</label>
                    <input className="input-field" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Your name" />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#7a7590", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Email Address</label>
                    <input className="input-field" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} placeholder="your@email.com" type="email" />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#7a7590", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Phone Number</label>
                    <input className="input-field" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+254 ..." />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "#7a7590", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Location</label>
                    <input className="input-field" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} placeholder="City, Country" />
                  </div>
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", color: "#7a7590", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Bio</label>
                  <textarea
                    className="input-field"
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button className="gold-btn" onClick={handleSave}>Save Changes</button>
                  <button className="ghost-btn" onClick={() => setEditForm({ name: reduxUser?.fullName || "", email: reduxUser?.email || "", phone: reduxUser?.phone || "", location: reduxUser?.location || "", bio: reduxUser?.bio || "", image: null })}>Discard</button>
                  {saved && (
                    <span style={{ color: "#5edc8e", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 18 }}>✓</span> Saved successfully!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* AVATAR */}
            {activeTab === "avatar" && (
              <div className="card" style={{ padding: 36 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0ecff", marginBottom: 6 }}>Profile Avatar</h2>
                <p style={{ color: "#5a5575", fontSize: 14, marginBottom: 30 }}>Upload a photo that represents you across the store.</p>

                {/* Current avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px 28px", background: "#16141f", borderRadius: 16, border: "1px solid #2a2740", marginBottom: 28 }}>
                  <div className="avatar-ring" style={{ width: 80, height: 80 }}>
                    <div className="avatar-inner" style={{ fontSize: 24 }}>
                      {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
                    </div>
                  </div>
                  <div>
                    <p style={{ color: "#d8d4e8", fontWeight: 600, marginBottom: 4 }}>Current Avatar</p>
                    <p style={{ color: "#5a5575", fontSize: 13 }}>{avatarSrc ? "Custom photo uploaded" : "Using initials placeholder"}</p>
                  </div>
                  {avatarSrc && (
                    <button
                      onClick={() => setAvatarPreview(null)}
                      className="ghost-btn"
                      style={{ marginLeft: "auto", padding: "10px 20px", fontSize: 13 }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Drop Zone */}
                <div
                  className={`drop-zone ${dragOver ? "active" : ""}`}
                  onClick={() => fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleAvatarFile(e.dataTransfer.files[0]); }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📸</div>
                  <p style={{ color: "#d8d4e8", fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Drag & drop your photo here</p>
                  <p style={{ color: "#5a5575", fontSize: 13, marginBottom: 20 }}>or click to browse files</p>
                  <span className="badge" style={{ background: "#c9a84c18", color: "#c9a84c", border: "1px solid #c9a84c33" }}>
                    JPG, PNG, WEBP — Max 5MB
                  </span>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleAvatarFile(e.target.files[0])} />
                </div>

                {avatarPreview && (
                  <div style={{ marginTop: 24, padding: "18px 22px", background: "#0f1f14", border: "1px solid #1a4a28", borderRadius: 14, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>✅</span>
                    <div>
                      <p style={{ color: "#5edc8e", fontWeight: 600, fontSize: 14 }}>New avatar ready</p>
                      <p style={{ color: "#3a7a50", fontSize: 12 }}>Your new avatar is set and saved.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CHANGE PASSWORD */}
            {activeTab === "password" && (
              <div className="card" style={{ padding: 36 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0ecff", marginBottom: 6 }}>Change Password</h2>
                <p style={{ color: "#5a5575", fontSize: 14, marginBottom: 30 }}>Choose a strong password to keep your account secure.</p>

                <div style={{ maxWidth: 440 }}>
                  {[
                    { label: "Current Password", key: "current", val: passwordForm.current, show: showCurrentPwd, toggle: () => setShowCurrentPwd(v => !v) },
                    { label: "New Password", key: "newPass", val: passwordForm.newPass, show: showNewPwd, toggle: () => setShowNewPwd(v => !v) },
                    { label: "Confirm New Password", key: "confirm", val: passwordForm.confirm, show: showConfirmPwd, toggle: () => setShowConfirmPwd(v => !v) },
                  ].map((field) => (
                    <div key={field.key} style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", color: "#7a7590", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{field.label}</label>
                      <div style={{ position: "relative" }}>
                        <input
                          className="input-field"
                          type={field.show ? "text" : "password"}
                          value={field.val}
                          onChange={e => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                          placeholder="••••••••••"
                          style={{ paddingRight: 48 }}
                        />
                        <button className="pwd-toggle" onClick={field.toggle} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>
                          {field.show ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Strength indicator */}
                  {passwordForm.newPass.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        {[...Array(4)].map((_, i) => (
                          <div key={i} style={{
                            flex: 1, height: 4, borderRadius: 2,
                            background: i < (passwordForm.newPass.length >= 12 ? 4 : passwordForm.newPass.length >= 8 ? 3 : passwordForm.newPass.length >= 6 ? 2 : 1) ? "#c9a84c" : "#2a2740",
                            transition: "background 0.3s"
                          }} />
                        ))}
                      </div>
                      <p style={{ color: "#5a5575", fontSize: 12 }}>
                        Strength: {passwordForm.newPass.length >= 12 ? "🟢 Strong" : passwordForm.newPass.length >= 8 ? "🟡 Good" : passwordForm.newPass.length >= 6 ? "🟠 Fair" : "🔴 Weak"}
                      </p>
                    </div>
                  )}

                  {pwdMsg && (
                    <div style={{
                      padding: "14px 18px",
                      borderRadius: 12,
                      marginBottom: 20,
                      background: pwdMsg.type === "success" ? "#0f1f14" : "#1f0f0f",
                      border: `1px solid ${pwdMsg.type === "success" ? "#1a4a28" : "#4a1a1a"}`,
                      color: pwdMsg.type === "success" ? "#5edc8e" : "#e08080",
                      fontSize: 14,
                      display: "flex", alignItems: "center", gap: 10
                    }}>
                      <span>{pwdMsg.type === "success" ? "✅" : "⚠️"}</span> {pwdMsg.text}
                    </div>
                  )}

                  <button className="gold-btn" onClick={handlePasswordSave}>Update Password</button>
                </div>
              </div>
            )}

            {/* DELETE ACCOUNT */}
            {activeTab === "delete" && (
              <div>
                <div className="card" style={{ padding: 36, border: "1px solid #3a1a1a", background: "linear-gradient(145deg, #1a0e0e99, #13080899)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "#e0555518", border: "1px solid #e0555544", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚠️</div>
                    <div>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#f0c0c0", marginBottom: 4 }}>Delete Account</h2>
                      <p style={{ color: "#7a4040", fontSize: 14 }}>This action is permanent and cannot be undone.</p>
                    </div>
                  </div>

                  <div style={{ padding: "20px 22px", background: "#1a0808", border: "1px solid #3a1a1a", borderRadius: 14, marginBottom: 28 }}>
                    <p style={{ color: "#c08080", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>You will permanently lose:</p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        `${reduxUser?.orders?.length ?? 0} order history records`,
                        "All saved wishlist items",
                        "All submitted reviews",
                        "All account data and preferences",
                        "Access to your purchase history & receipts",
                      ].map(item => (
                        <li key={item} style={{ color: "#8a5050", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#e05555", fontSize: 10 }}>✕</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <label style={{ display: "block", color: "#7a4040", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                      Type <span style={{ color: "#e05555", fontFamily: "monospace" }}>DELETE</span> to confirm
                    </label>
                    <input
                      className="delete-input"
                      placeholder="Type DELETE here..."
                      value={deleteConfirm}
                      onChange={e => setDeleteConfirm(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={() => deleteConfirm === "DELETE" && setShowDeleteModal(true)}
                    style={{
                      background: deleteConfirm === "DELETE" ? "linear-gradient(135deg, #c0392b, #e74c3c)" : "#2a1010",
                      color: deleteConfirm === "DELETE" ? "#fff" : "#5a3030",
                      border: "none",
                      borderRadius: 12,
                      padding: "13px 28px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: deleteConfirm === "DELETE" ? "pointer" : "not-allowed",
                      transition: "all 0.3s ease",
                      boxShadow: deleteConfirm === "DELETE" ? "0 4px 20px #e74c3c44" : "none",
                    }}
                  >
                    🗑️ Delete My Account
                  </button>
                </div>

                {/* Modal */}
                {showDeleteModal && (
                  <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#18121a", border: "1px solid #3a1a1a", borderRadius: 20, padding: 40, maxWidth: 400, width: "90%", textAlign: "center" }}>
                      <div style={{ fontSize: 52, marginBottom: 16 }}>💔</div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#f0c0c0", marginBottom: 12 }}>We're sorry to see you go</h3>
                      <p style={{ color: "#7a4040", fontSize: 14, marginBottom: 28 }}>This will permanently delete your account and all associated data.</p>
                      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button className="ghost-btn" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}>Cancel</button>
                        <button onClick={async () => {
                            await deleteAccountAPI();
                            dispatch(logoutUser());
                            navigate("/");
                        }} style={{ background: "linear-gradient(135deg, #c0392b, #e74c3c)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 24px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}