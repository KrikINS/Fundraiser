import { useState, useMemo, useEffect } from "react";
import { HashRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Check, Plus, Heart, FolderPlus, Printer, Menu, X, User, Lock, Globe, LogOut, Users } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { Capacitor } from '@capacitor/core';
import { Printer as CapPrinter } from '@capgo/capacitor-printer';

const supabaseUrl = "https://iqkehtzsakanwqhqdjhq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxa2VodHpzYWthbndxaHFkamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzYwODcsImV4cCI6MjA5Nzk1MjA4N30.6DdxAgfSqnwgm7ehR7coZrdiB2Sil_jLH5oXINeHgGY";
const supabase = createClient(supabaseUrl, supabaseKey);

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "SAR", "QAR", "OMR", "KWD", "BHD"];
const SYMBOLS = { USD: "$", EUR: "€", GBP: "£", INR: "₹", AED: "د.إ", SAR: "ر.س", QAR: "ر.ق", OMR: "ر.ع.", KWD: "د.ك", BHD: "د.ب" };

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

/* Print Styles */
@media print {
  .no-print {
    display: none !important;
  }
  body, html {
    background-color: #FFFFFF !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    height: auto !important;
    overflow: visible !important;
  }
  .print-area {
    width: 100% !important;
    max-width: 800px !important;
    margin: 0 auto !important;
    padding: 0px !important;
    color: #0F172A !important;
  }
  
  .print-bg-white {
    background-color: #FFFFFF !important;
    color: #0F172A !important;
  }
  .print-card {
    background-color: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
  }
  .print-text-main {
    color: #0F172A !important;
  }
  .print-text-sub {
    color: #64748B !important;
  }
  
  svg circle.ring-bg {
    stroke: #E2E8F0 !important;
  }
  
  .scroll-container {
    overflow: visible !important;
    height: auto !important;
    background-color: #FFFFFF !important;
  }
  
  .print-only { display: block !important; }

  /* Aggressive Print Layout Shrinking */
  .dashboard-card {
    padding: 8px 12px !important;
    margin-bottom: 8px !important;
    border-radius: 8px !important;
  }
  .rings-container {
    transform: scale(0.6) !important;
    transform-origin: top center !important;
    margin-bottom: -90px !important;
  }
  .rings-container > div {
    margin-top: -15px !important;
  }
  .contributions-wrapper {
    margin-top: 0px !important;
  }
  .contributions-list {
    gap: 4px !important;
  }
  .print-card {
    padding: 4px 8px !important;
    border-radius: 6px !important;
    gap: 4px !important;
  }
  .print-text-main { font-size: 11px !important; }
  .print-text-sub { font-size: 9px !important; margin-top: 0 !important; }
  .notes-wrapper {
    margin-top: 8px !important;
  }
  textarea.print-card {
    min-height: 30px !important;
    height: 40px !important;
    font-size: 10px !important;
    padding: 4px 8px !important;
  }
  .app-footer {
    margin-top: 12px !important;
    padding-top: 8px !important;
    padding-bottom: 0px !important;
  }
  .app-footer p { font-size: 8px !important; margin-bottom: 0 !important; }
}

/* Drawer Styles */
.sidebar-drawer {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: 280px;
  background: #121E1A;
  border-right: 1px solid #2A3B33;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}
.sidebar-drawer.open {
  transform: translateX(0);
}
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 40;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.sidebar-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  /* Main Content Area */
  .main-content {
    padding: 20px 12px 64px !important;
  }
  
  /* Dashboard layout */
  .rings-container {
    flex-wrap: wrap !important;
    gap: 24px !important;
  }
  .dashboard-card {
    padding: 24px 16px !important;
    border-radius: 16px !important;
  }
  .header-title {
    font-size: 26px !important;
  }
  
  /* Forms & Items */
  .form-container {
    flex-direction: column !important;
  }
  .form-container > * {
    width: 100% !important;
    flex: none !important;
  }
}
`;

function Auth({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onSuccess && onSuccess();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        setError('Success! You are now logged in.');
        onSuccess && onSuccess();
      }
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '60px auto', background: '#1E332C', padding: 24, borderRadius: 16, border: '1px solid #2A3B33' }}>
      <h2 style={{ fontFamily: 'Fraunces', fontSize: 24, color: '#F4F1E8', marginBottom: 20, textAlign: 'center' }}>
        {isLogin ? 'Welcome Back' : 'Create Account'}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input 
          type="email" 
          placeholder="Email address" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, background: '#121E1A', border: '1px solid #2A3B33', color: '#F4F1E8', outline: 'none' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          required
          style={{ padding: 12, borderRadius: 8, background: '#121E1A', border: '1px solid #2A3B33', color: '#F4F1E8', outline: 'none' }}
        />
        {error && <div style={{ color: '#E8714A', fontSize: 13 }}>{error}</div>}
        <button 
          type="submit"
          style={{ background: '#D4A24C', color: '#16241F', padding: 12, borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}
        >
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9CAFA5' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span style={{ color: '#D4A24C', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Sign up' : 'Log in'}
        </span>
      </div>
    </div>
  );
}

function GrowthRing({ percent, label, sub, size = 220 }) {
  const r = 88;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(percent, 1);
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
        <circle className="ring-bg" cx="110" cy="110" r={r} fill="none" stroke="#2A3B33" strokeWidth="14" />
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke="#D4A24C"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c - clamped * c}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="print-text-sub" style={{ fontFamily: "Inter", fontSize: size * (11/220), letterSpacing: "0.12em", color: "#9CAFA5", textTransform: "uppercase", textAlign: "center" }}>
          {label}
        </div>
        <div className="print-text-main" style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: size * (30/220), color: "#F4F1E8", marginTop: size * (4/220), textAlign: "center" }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

function FundraiserDashboard({ rates, session }) {
  const { id } = useParams();
  const [fundraiser, setFundraiser] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", currency: "INR" });
  const [error, setError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [newNote, setNewNote] = useState("");

  const isOwner = session?.user?.id === fundraiser?.owner_id;
  const [inviteEmail, setInviteEmail] = useState("");

  const handlePrint = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await CapPrinter.printWebView();
      } catch (e) {
        console.error("Print failed", e);
        window.print();
      }
    } else {
      window.print();
    }
  };

  async function togglePrivacy() {
    if (!isOwner) return;
    updateFundraiser({ is_private: !fundraiser.is_private });
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail.trim() || !isOwner) return;
    const updatedInvites = [...(fundraiser.invited_emails || []), inviteEmail.trim()];
    updateFundraiser({ invited_emails: updatedInvites });
    setInviteEmail("");
  }

  useEffect(() => {
    async function loadData() {
      // Fetch fundraiser details
      const { data: fData } = await supabase.from("fundraisers").select("*").eq("id", id).single();
      if (fData) {
        if (fData.is_private) {
          const isFDataOwner = session?.user?.id === fData.owner_id;
          const isInvited = fData.invited_emails?.includes(session?.user?.email);
          if (!isFDataOwner && !isInvited) {
            setFundraiser({ accessDenied: true });
            return;
          }
        }
        setFundraiser(fData);
        setForm(f => ({ ...f, currency: fData.currency }));
      }
      
      // Fetch contributions
      const { data: cData } = await supabase
        .from("contributions")
        .select("*")
        .eq("fundraiser_id", id)
        .order("created_at", { ascending: false });
      if (cData) {
        setContributions(cData);
      }
    }
    loadData();
  }, [id]);

  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (!rates) return amount;
    const rateFrom = rates[fromCurrency.toLowerCase()] || 1;
    const rateTo = rates[toCurrency.toLowerCase()] || 1;
    return (amount / rateFrom) * rateTo;
  };

  const formatAmount = (num) => Math.round(num).toLocaleString();

  async function updateFundraiser(updates) {
    setFundraiser((prev) => ({ ...prev, ...updates }));
    const { error } = await supabase.from("fundraisers").update(updates).eq("id", id);
    if (error) {
      if (updates.notes !== undefined) {
        setNotesError("Please run the SQL command to add the 'notes' column to your database first!");
      }
    } else {
      if (updates.notes !== undefined) setNotesError("");
    }
  }

  async function addNote() {
    if (!newNote.trim()) return;
    const stamp = new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formattedNote = `[${stamp}] ${newNote.trim()}`;
    const updatedNotes = fundraiser.notes ? `${formattedNote}\n\n${fundraiser.notes}` : formattedNote;
    
    setFundraiser((prev) => ({ ...prev, notes: updatedNotes }));
    setNewNote("");
    
    const { error } = await supabase.from("fundraisers").update({ notes: updatedNotes }).eq("id", id);
    if (error) {
      setNotesError("Please run the SQL command to add the 'notes' column to your database first!");
    } else {
      setNotesError("");
    }
  }

  async function addContribution(e) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.name.trim()) return setError("Enter a contributor name.");
    if (!amt || amt <= 0) return setError("Enter an amount greater than zero.");
    setError("");

    const newContribution = {
      fundraiser_id: id,
      name: form.name.trim(),
      amount: amt,
      currency: form.currency,
      confirmed: false,
    };

    const { data, error } = await supabase.from("contributions").insert([newContribution]).select();
    if (data && data.length > 0) {
      setContributions((prev) => [data[0], ...prev]);
    } else {
      console.error(error);
      setError("Failed to add contribution.");
    }
    setForm({ name: "", amount: "", currency: fundraiser.currency });
  }

  async function toggleConfirm(cid, currentStatus) {
    setContributions((prev) => prev.map((c) => (c.id === cid ? { ...c, confirmed: !currentStatus } : c)));
    const { error } = await supabase.from("contributions").update({ confirmed: !currentStatus }).eq("id", cid);
    if (error) {
      setContributions((prev) => prev.map((c) => (c.id === cid ? { ...c, confirmed: currentStatus } : c)));
      setError("Failed to update status.");
    }
  }

  async function removeContribution(cid) {
    setContributions((prev) => prev.filter((c) => c.id !== cid));
    await supabase.from("contributions").delete().eq("id", cid);
  }

  if (!fundraiser) return <div style={{ padding: 40, color: '#9CAFA5' }}>Loading dashboard...</div>;
  if (fundraiser.accessDenied) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#9CAFA5' }}>
        <Lock size={48} color="#2A3B33" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ color: '#F4F1E8', fontFamily: 'Fraunces', fontSize: 24, marginBottom: 12 }}>Private Campaign</h2>
        <p>You do not have permission to view this campaign. Please log in or ask for an invite.</p>
        {!session && <Auth />}
      </div>
    );
  }

  const currency = fundraiser.currency;
  const symbol = SYMBOLS[currency];
  
  const confirmedTotal = contributions.filter((c) => c.confirmed).reduce((s, c) => s + convertAmount(c.amount, c.currency, currency), 0);
  const raisedTotal = contributions.reduce((s, c) => s + convertAmount(c.amount, c.currency, currency), 0);
  const pendingTotal = raisedTotal - confirmedTotal;
  
  const raisedPercent = fundraiser.goal > 0 ? raisedTotal / fundraiser.goal : 0;
  const confirmedPercent = fundraiser.goal > 0 ? confirmedTotal / fundraiser.goal : 0;

  return (
    <div className="print-area main-content" style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 64 }}>
      {/* Header */}
      {isOwner && (
        <div className="no-print" style={{ background: '#1E332C', border: '1px solid #2A3B33', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: fundraiser.is_private ? 16 : 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F4F1E8', fontWeight: 600, fontSize: 14 }}>
                {fundraiser.is_private ? <Lock size={16} color="#D4A24C" /> : <Globe size={16} color="#7CB396" />}
                {fundraiser.is_private ? 'Private Campaign' : 'Public Campaign'}
              </div>
              <div style={{ fontSize: 12, color: '#9CAFA5', marginTop: 4 }}>
                {fundraiser.is_private ? 'Only you and invited users can see this.' : 'Anyone with the link can see this.'}
              </div>
            </div>
            <button 
              onClick={togglePrivacy}
              style={{ background: 'transparent', border: '1px solid #D4A24C', color: '#D4A24C', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
            >
              Make {fundraiser.is_private ? 'Public' : 'Private'}
            </button>
          </div>
          
          {fundraiser.is_private && (
            <div style={{ borderTop: '1px solid #2A3B33', paddingTop: 16 }}>
              <div style={{ fontSize: 13, color: '#F4F1E8', marginBottom: 8, fontWeight: 500 }}>Invited Users:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {fundraiser.invited_emails?.length > 0 ? fundraiser.invited_emails.map(email => (
                  <span key={email} style={{ background: '#121E1A', padding: '4px 8px', borderRadius: 4, fontSize: 12, color: '#9CAFA5' }}>{email}</span>
                )) : <span style={{ fontSize: 12, color: '#6E8278' }}>No one invited yet.</span>}
              </div>
              <form onSubmit={handleInvite} style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="email" 
                  placeholder="Invite by email..." 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  style={{ flex: 1, background: '#121E1A', border: '1px solid #2A3B33', borderRadius: 6, padding: '8px 12px', color: '#F4F1E8', fontSize: 13, outline: 'none' }}
                />
                <button type="submit" disabled={!inviteEmail.trim()} style={{ background: inviteEmail.trim() ? '#D4A24C' : '#2A3B33', color: '#16241F', border: 'none', borderRadius: 6, padding: '0 16px', fontWeight: 600, cursor: inviteEmail.trim() ? 'pointer' : 'default' }}>
                  Invite
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Heart size={16} color="#E8714A" fill="#E8714A" />
          <span className="print-text-sub" style={{ fontSize: 11, letterSpacing: "0.14em", color: "#9CAFA5", textTransform: "uppercase" }}>
            Fundraiser Dashboard
          </span>
        </div>
        <button 
          className="no-print"
          onClick={handlePrint}
          style={{ background: "transparent", border: "1px solid #2A3B33", color: "#9CAFA5", borderRadius: 8, padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontWeight: 500, transition: "background 0.2s" }}
          onMouseOver={(e) => e.currentTarget.style.background = "#1E332C"}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          <Printer size={14} /> Print PDF
        </button>
      </div>

      {editingName ? (
        <input
          autoFocus
          className="no-print header-title"
          value={fundraiser.title}
          onChange={(e) => setFundraiser({ ...fundraiser, title: e.target.value })}
          onBlur={(e) => {
            setEditingName(false);
            updateFundraiser({ title: fundraiser.title });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditingName(false);
              updateFundraiser({ title: fundraiser.title });
            }
          }}
          style={{
            fontFamily: "Fraunces",
            fontWeight: 700,
            fontSize: 30,
            background: "transparent",
            border: "none",
            borderBottom: "2px solid #D4A24C",
            color: "#F4F1E8",
            width: "100%",
            outline: "none",
            padding: "2px 0",
            marginBottom: 20,
          }}
        />
      ) : (
        <h1
          className="print-text-main header-title"
          onClick={() => setEditingName(true)}
          style={{
            fontFamily: "Fraunces",
            fontWeight: 700,
            fontSize: 30,
            lineHeight: 1.15,
            color: "#F4F1E8",
            margin: "4px 0 20px",
            cursor: "pointer",
          }}
          title="Click to rename"
        >
          {fundraiser.title}
        </h1>
      )}

      {/* Growth ring card */}
      <div
        className="print-card dashboard-card"
        style={{
          background: "#1E332C",
          borderRadius: 20,
          padding: "32px 24px",
          border: "1px solid #2A3B33",
        }}
      >
        <div className="rings-container" style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <GrowthRing percent={raisedPercent} label="Raised so far" sub={`${symbol}${formatAmount(raisedTotal)}`} size={180} />
          <GrowthRing percent={confirmedPercent} label="Received" sub={`${symbol}${formatAmount(confirmedTotal)}`} size={180} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18, alignItems: "center", flexWrap: "wrap" }}>
          <span className="print-text-sub" style={{ fontSize: 13, color: "#9CAFA5" }}>of</span>
          {editingGoal ? (
            <input
              autoFocus
              className="no-print"
              type="number"
              value={fundraiser.goal}
              onChange={(e) => setFundraiser({ ...fundraiser, goal: parseFloat(e.target.value) || 0 })}
              onBlur={() => {
                setEditingGoal(false);
                updateFundraiser({ goal: fundraiser.goal });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingGoal(false);
                  updateFundraiser({ goal: fundraiser.goal });
                }
              }}
              style={{ width: 90, background: "transparent", border: "none", borderBottom: "1px solid #D4A24C", color: "#F4F1E8", fontSize: 13, outline: "none", fontFamily: "Inter" }}
            />
          ) : (
            <span
              onClick={() => setEditingGoal(true)}
              style={{ fontSize: 13, color: "#D4A24C", cursor: "pointer", fontWeight: 600 }}
              title="Click to edit goal"
            >
              {symbol}{formatAmount(fundraiser.goal)} goal
            </span>
          )}
          <select
            className="no-print"
            value={currency}
            onChange={(e) => updateFundraiser({ currency: e.target.value })}
            style={{ background: "#16241F", border: "1px solid #2A3B33", color: "#9CAFA5", fontSize: 12, borderRadius: 6, padding: "2px 6px", marginLeft: 4 }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="print-only" style={{ display: "none", color: "#D4A24C", fontSize: 13, fontWeight: 600 }}>{currency}</span>
        </div>
        {pendingTotal > 0 && (
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "#C99A5B" }}>
            {symbol}{formatAmount(pendingTotal)} pending receipt
          </div>
        )}
      </div>

      {/* Add contribution */}
      <form className="no-print form-container" onSubmit={addContribution} style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <input
          placeholder="Contributor name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          style={{ flex: "1 1 140px", background: "#1E332C", border: "1px solid #2A3B33", borderRadius: 10, padding: "10px 12px", color: "#F4F1E8", fontSize: 14, outline: "none", fontFamily: "Inter" }}
        />
        <div style={{ display: "flex", flex: "1 1 120px" }}>
          <input
            placeholder="Amount"
            type="number"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            style={{ flex: 1, width: "100%", background: "#1E332C", border: "1px solid #2A3B33", borderRight: "none", borderRadius: "10px 0 0 10px", padding: "10px 12px", color: "#F4F1E8", fontSize: 14, outline: "none", fontFamily: "Inter" }}
          />
          <select
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            style={{ background: "#2A3B33", border: "1px solid #2A3B33", borderRadius: "0 10px 10px 0", color: "#F4F1E8", fontSize: 13, padding: "0 8px", outline: "none" }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ background: "#D4A24C", border: "none", borderRadius: 10, padding: "10px 16px", color: "#16241F", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
          <Plus size={16} /> Add
        </button>
      </form>
      {error && <div className="no-print" style={{ color: "#E8714A", fontSize: 12, marginTop: 6 }}>{error}</div>}

      {/* Contributors list */}
      <div className="contributions-wrapper" style={{ marginTop: 28 }}>
        <div className="print-text-sub" style={{ fontSize: 11, letterSpacing: "0.12em", color: "#9CAFA5", textTransform: "uppercase", marginBottom: 10 }}>
          Contributors ({contributions.length})
        </div>
        <div className="contributions-list" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {contributions.length === 0 && (
            <div className="print-text-sub" style={{ color: "#6E8278", fontSize: 14, padding: "16px 0" }}>No contributions yet — be the first to add one above.</div>
          )}
          {contributions.map((c) => (
            <div key={c.id} className="print-card" style={{ display: "flex", flexDirection: "column", gap: 12, background: "#1E332C", border: "1px solid #2A3B33", borderRadius: 12, padding: "12px 14px", pageBreakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="print-text-main" style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                  <div className="print-text-sub" style={{ fontSize: 11, color: "#6E8278", marginTop: 4 }}>
                    {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(c.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="print-text-sub" style={{ fontSize: 14, fontWeight: 600, color: "#D4A24C" }}>
                    {SYMBOLS[c.currency] || c.currency}{c.amount.toLocaleString()}
                  </div>
                  {c.currency !== currency && rates && (
                    <div className="print-text-sub" style={{ opacity: 0.6, fontSize: 11, color: "#9CAFA5", marginTop: 2 }}>
                      (~{symbol}{formatAmount(convertAmount(c.amount, c.currency, currency))})
                    </div>
                  )}
                </div>
              </div>
              <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => toggleConfirm(c.id, c.confirmed)}
                  style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", gap: 6, background: c.confirmed ? "rgba(124,179,150,0.15)" : "rgba(212,162,76,0.15)", border: `1px solid ${c.confirmed ? "#7CB396" : "#D4A24C"}`, color: c.confirmed ? "#7CB396" : "#D4A24C", borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  <Check size={14} />
                  {c.confirmed ? "Received" : "Mark received"}
                </button>
                <button onClick={() => removeContribution(c.id)} aria-label="Remove contribution" style={{ background: "transparent", border: "none", color: "#6E8278", fontSize: 18, cursor: "pointer", padding: "0 8px" }}>
                  ×
                </button>
              </div>
              
              {/* Print-only confirmation status instead of buttons */}
              <div className="print-only" style={{ display: "none", fontSize: 12, fontWeight: 600, color: c.confirmed ? "#7CB396" : "#D4A24C" }}>
                {c.confirmed ? "✓ Received" : "Pending"}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Campaign Notes */}
      <div className="notes-wrapper" style={{ marginTop: 32 }}>
        <div className="print-text-sub" style={{ fontSize: 11, letterSpacing: "0.12em", color: "#9CAFA5", textTransform: "uppercase", marginBottom: 10 }}>
          Campaign Notes
        </div>
        {notesError && <div className="no-print" style={{ color: "#E8714A", fontSize: 12, marginBottom: 8 }}>{notesError}</div>}
        <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <textarea
            placeholder="Type a new note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={{
              flex: 1,
              background: "#1E332C",
              border: "1px solid #2A3B33",
              borderRadius: 8,
              padding: "10px",
              color: "#F4F1E8",
              fontSize: 13,
              lineHeight: 1.4,
              outline: "none",
              fontFamily: "Inter",
              resize: "vertical",
              minHeight: 60
            }}
          />
          <button
            onClick={addNote}
            disabled={!newNote.trim()}
            style={{
              background: newNote.trim() ? "#D4A24C" : "#2A3B33",
              color: newNote.trim() ? "#16241F" : "#6E8278",
              border: "none",
              borderRadius: 8,
              padding: "0 16px",
              fontWeight: 600,
              cursor: newNote.trim() ? "pointer" : "default",
              transition: "0.2s"
            }}
          >
            Add Note
          </button>
        </div>
        <textarea
          className="print-card print-text-main"
          placeholder="No notes yet..."
          value={fundraiser.notes || ""}
          onChange={(e) => setFundraiser({ ...fundraiser, notes: e.target.value })}
          onBlur={(e) => updateFundraiser({ notes: fundraiser.notes })}
          style={{
            width: "100%",
            minHeight: 120,
            background: "rgba(30, 51, 44, 0.5)",
            border: "1px solid #2A3B33",
            borderRadius: 12,
            padding: "14px",
            color: "#9CAFA5",
            fontSize: 13,
            lineHeight: 1.5,
            outline: "none",
            fontFamily: "Inter",
            resize: "vertical"
          }}
        />
      </div>

      {/* AppTerra Footer */}
      <div className="app-footer" style={{ marginTop: 60, paddingTop: 24, borderTop: "1px solid #2A3B33", textAlign: "center", color: "#6E8278", fontSize: 12, lineHeight: 1.6, pageBreakInside: "avoid" }}>
        <p className="print-text-sub" style={{ fontWeight: 700, color: "#9CAFA5", marginBottom: 4, letterSpacing: "0.05em", fontFamily: "Inter" }}>A PRODUCT OF APPTERRA</p>
        <p className="print-text-sub" style={{ color: "#6E8278" }}>© {new Date().getFullYear()} AppTerra Inc. All rights reserved.<br/>Empowering communities to raise funds effectively and transparently.</p>
      </div>
    </div>
  );
}

function Sidebar({ fundraisers, onAddFundraiser, onClose, session }) {
  const location = useLocation();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={20} color="#E8714A" fill="#E8714A" />
          <span style={{ fontSize: 13, letterSpacing: "0.14em", color: "#F4F1E8", textTransform: "uppercase", fontWeight: 700 }}>
            My Campaigns
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9CAFA5', cursor: 'pointer', padding: 4 }}>
          <X size={20} />
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', paddingRight: 4 }}>
          {fundraisers.map(f => {
            const isActive = location.pathname === `/fundraiser/${f.id}`;
            return (
              <Link 
                key={f.id} 
                to={`/fundraiser/${f.id}`} 
                onClick={onClose}
                style={{ 
                  textDecoration: 'none', 
                  color: isActive ? '#F4F1E8' : '#9CAFA5', 
                  padding: '10px 12px', 
                  borderRadius: 8, 
                  background: isActive ? '#1E332C' : 'transparent', 
                  fontSize: 14, 
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                {f.title}
              </Link>
            )
          })}
        </div>

        <button 
          onClick={() => {
            if (!session) {
              alert("Please log in to create a campaign.");
              return;
            }
            onAddFundraiser();
            onClose();
          }} 
          style={{ marginTop: 'auto', background: 'transparent', border: '1px solid #2A3B33', color: '#D4A24C', padding: '12px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, flexShrink: 0 }}
        >
          <FolderPlus size={16} /> New Fundraiser
        </button>

        <div style={{ marginTop: 16, borderTop: '1px solid #2A3B33', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {session ? (
            <>
              <div style={{ fontSize: 12, color: '#9CAFA5', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.user.email}</div>
              <button onClick={() => supabase.auth.signOut()} style={{ background: 'transparent', border: 'none', color: '#E8714A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}><LogOut size={14} /> Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#D4A24C', textDecoration: 'none', fontSize: 14, fontWeight: 600, width: '100%', justifyContent: 'center' }}>
              <User size={16} /> Log in or Sign up
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function MainApp() {
  const [rates, setRates] = useState(null);
  const [fundraisers, setFundraisers] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json")
      .then((res) => res.json())
      .then((data) => setRates(data.usd))
      .catch((err) => console.error("Failed to load rates", err));
  }, []);

  useEffect(() => {
    async function loadFundraisers() {
      const { data } = await supabase.from("fundraisers").select("*").order("created_at", { ascending: false });
      if (data) {
        const visible = data.filter(f => 
          !f.is_private || 
          f.owner_id === session?.user?.id || 
          f.invited_emails?.includes(session?.user?.email)
        );
        setFundraisers(visible);
      }
    }
    loadFundraisers();

    const channel = supabase.channel('fundraisers-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fundraisers' }, () => {
        loadFundraisers();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session]);

  async function handleAddFundraiser() {
    if (!session) {
      alert("Please log in to create a campaign.");
      return;
    }
    const { data } = await supabase.from("fundraisers").insert([{
      title: 'New Fundraiser',
      goal: 5000,
      currency: 'INR',
      owner_id: session.user.id,
      is_private: false
    }]).select();

    if (data && data.length > 0) {
      setFundraisers([data[0], ...fundraisers]);
      navigate(`/fundraiser/${data[0].id}`);
    }
  }

  return (
    <div className="print-bg-white app-container" style={{ display: 'flex', minHeight: '100vh', background: '#16241F', fontFamily: 'Inter, sans-serif', color: '#F4F1E8' }}>
      <style>{FONTS}</style>
      
      {/* Print-only CSS block */}
      <style>{`
        .print-only { display: none !important; }
        @media print {
          .print-only { display: block !important; }
        }
      `}</style>
      
      {/* Sidebar Overlay */}
      <div className={`no-print sidebar-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)} />
      
      {/* Sidebar Drawer */}
      <div className={`no-print sidebar-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <Sidebar fundraisers={fundraisers} onAddFundraiser={handleAddFundraiser} onClose={() => setIsDrawerOpen(false)} session={session} />
      </div>
      
      <div className="scroll-container main-content" style={{ flex: 1, padding: "20px 16px 0px", overflowY: 'auto', width: '100%' }}>
        
        {/* Hamburger Menu Header */}
        <div className="no-print" style={{ maxWidth: 480, margin: "0 auto", marginBottom: 20 }}>
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            style={{ 
              background: 'rgba(30, 51, 44, 0.8)', 
              border: '1px solid #2A3B33', 
              color: '#F4F1E8', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              padding: '8px 14px',
              borderRadius: 12
            }}
          >
            <Menu size={20} color="#D4A24C" />
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu</span>
          </button>
        </div>

        <Routes>
          <Route path="/" element={
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h2 style={{ color: '#F4F1E8', fontFamily: 'Fraunces', fontSize: 28, margin: 0 }}>Public Campaigns</h2>
                {!session && <Link to="/login" style={{ color: '#D4A24C', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Log In / Sign Up</Link>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {fundraisers.filter(f => !f.is_private).length === 0 && (
                  <div style={{ textAlign: 'center', color: '#6E8278', padding: 40 }}>No public campaigns found.</div>
                )}
                {fundraisers.filter(f => !f.is_private).map(f => (
                  <Link key={f.id} to={`/fundraiser/${f.id}`} style={{ display: 'block', textDecoration: 'none', background: '#1E332C', border: '1px solid #2A3B33', borderRadius: 16, padding: 20, transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform='none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: 0, color: '#F4F1E8', fontSize: 18, fontFamily: 'Fraunces' }}>{f.title}</h3>
                      <span style={{ color: '#D4A24C', fontSize: 14, fontWeight: 600 }}>{f.currency} {f.goal.toLocaleString()} goal</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          } />
          <Route path="/login" element={<Auth onSuccess={() => navigate('/')} />} />
          <Route path="/fundraiser/:id" element={<FundraiserDashboard rates={rates} session={session} />} />
        </Routes>
      </div>
    </div>
  );
}

export default function FundraiserApp() {
  return (
    <HashRouter>
      <MainApp />
    </HashRouter>
  );
}
