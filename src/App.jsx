import { useState, useEffect } from "react";

const SUPABASE_URL = "https://tbptrbihjcqbonnjnxog.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicHRyYmloamNxYm9ubmpueG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDc1NDAsImV4cCI6MjA5NTMyMzU0MH0.fBOF9AcZrSBsDJ8ckRt35Eje4KoFpjXHaMflYazrW7U";
const ADMIN_PASSWORD = "Ts!9vX#mQ2@wLpR7$kNz";

const SERVICES = [
  "Quick Insight Email Reading","Quick Insight Video Reading",
  "One Question Email Reading","One Question Video Reading",
  "Two Question Email Reading","Two Question Video Reading",
  "Three Question Email Reading","Three Question Video Reading",
  "Unlimited Questions Email Reading","Unlimited Questions Video Reading",
];

const HEAD = "'Arial Black','Impact','Franklin Gothic Heavy',sans-serif";
const BODY = "'Arial','Helvetica',sans-serif";
const LAV = "#b39ddb";
const LAV_DARK = "#9575cd";

const api = (path, opts = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(opts.headers || {}),
    },
  });

const Stars = ({ n, size = 16 }) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? "#e6a817" : "#ddd", fontSize: size }}>★</span>
  ));

const avg = (reviews) =>
  reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "—";

const sortList = (list, sort) => {
  const a = [...list];
  if (sort === "newest") return a.sort((x, y) => new Date(y.created_at) - new Date(x.created_at));
  if (sort === "highest") return a.sort((x, y) => y.rating - x.rating);
  if (sort === "helpful") return a.sort((x, y) => y.helpful - x.helpful);
  return a;
};

// ── Shared label/input styles ──
const labelSt = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 5, color: "#555" };
const inputSt = { width: "100%", border: "2px solid #ddd", padding: "10px 12px", fontSize: 14, fontFamily: BODY, boxSizing: "border-box", marginBottom: 14, outline: "none" };
const selectSt = { ...inputSt, background: "#fff" };
const textareaSt = { ...inputSt, minHeight: 90, resize: "vertical" };
const ctaBtn = (bg = LAV, shadow = LAV_DARK) => ({
  padding: "11px 26px", background: bg, color: "#fff", border: "none",
  fontSize: 12, fontFamily: HEAD, fontWeight: 900, textTransform: "uppercase",
  letterSpacing: 2, cursor: "pointer", boxShadow: `0 3px 0 ${shadow}`,
});

// ════════════════════════════════════════════
//  ADMIN PANEL
// ════════════════════════════════════════════
function AdminPanel({ onExit }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await api("reviews?order=created_at.desc");
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setDeleting(id);
    await api(`reviews?id=eq.${id}`, { method: "DELETE" });
    setReviews(reviews.filter(r => r.id !== id));
    setDeleting(null);
  };

  const ratingDist = [5,4,3,2,1].map(n => ({
    n, count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round(reviews.filter(r => r.rating === n).length / reviews.length * 100) : 0,
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", fontFamily: BODY }}>
      {/* Admin header */}
      <div style={{ background: "#1a0533", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, color: "#fff" }}>
            TAROT SPOT — ADMIN
          </div>
          <div style={{ fontSize: 11, color: LAV, letterSpacing: 1, marginTop: 2 }}>Review Management Dashboard</div>
        </div>
        <button onClick={onExit} style={{ ...ctaBtn("#555", "#333"), padding: "8px 18px", fontSize: 11 }}>← EXIT ADMIN</button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { label: "Total Reviews", val: reviews.length },
            { label: "Avg Rating", val: avg(reviews) },
            { label: "5-Star Reviews", val: reviews.filter(r => r.rating === 5).length },
            { label: "This Month", val: reviews.filter(r => new Date(r.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length },
          ].map(({ label, val }) => (
            <div key={label} style={{ flex: 1, minWidth: 120, background: "#fff", border: "2px solid #eee", padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: HEAD, fontSize: 32, fontWeight: 900, color: "#1a0533" }}>{val}</div>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Rating breakdown */}
        <div style={{ background: "#fff", border: "2px solid #eee", padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontFamily: HEAD, fontSize: 15, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Rating Breakdown</div>
          {ratingDist.map(({ n, count, pct }) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: "#555", width: 14, textAlign: "right" }}>{n}</span>
              <span style={{ fontSize: 12, color: "#e6a817" }}>★</span>
              <div style={{ flex: 1, height: 8, background: "#eee", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: LAV, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 11, color: "#999", width: 30 }}>{count} ({pct}%)</span>
            </div>
          ))}
        </div>

        {/* Review list */}
        <div style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, borderBottom: "3px solid #1a1a1a", paddingBottom: 8 }}>
          ALL REVIEWS
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>Loading reviews…</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#999" }}>No reviews yet.</div>
        ) : reviews.map(r => (
          <div key={r.id} style={{ background: "#fff", border: "2px solid #eee", padding: "16px 20px", marginBottom: 10, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</span>
                <Stars n={r.rating} size={13} />
                <span style={{ fontSize: 10, background: "#1a0533", color: "#fff", padding: "2px 8px", fontFamily: HEAD, textTransform: "uppercase", letterSpacing: 1 }}>{r.service || "General"}</span>
                <span style={{ fontSize: 10, color: "#aaa" }}>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span style={{ fontSize: 10, color: "#aaa" }}>· {r.helpful} helpful votes</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.6 }}>{r.review_text}</p>
            </div>
            <button
              onClick={() => deleteReview(r.id)}
              disabled={deleting === r.id}
              style={{ padding: "6px 14px", background: deleting === r.id ? "#ccc" : "#c0392b", color: "#fff", border: "none", fontSize: 11, fontFamily: HEAD, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, cursor: "pointer", flexShrink: 0 }}
            >
              {deleting === r.id ? "…" : "DELETE"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  MAIN PUBLIC APP
// ════════════════════════════════════════════
export default function TarotSpotReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState({ name: "", rating: 0, service: "", text: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterService, setFilterService] = useState("All");
  const [sort, setSort] = useState("newest");
  const [votedIds, setVotedIds] = useState([]);

  // Admin state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    const res = await api("reviews?order=created_at.desc");
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, []);

  const filtered = sortList(
    filterService === "All" ? reviews : reviews.filter(r => r.service === filterService),
    sort
  );

  const submitReview = async () => {
    if (!form.name || !form.rating || !form.text) return;
    setSubmitting(true);
    const res = await api("reviews", {
      method: "POST",
      body: JSON.stringify({ name: form.name, service: form.service || "General", rating: form.rating, review_text: form.text, helpful: 0 }),
    });
    const data = await res.json();
    if (Array.isArray(data) && data[0]) {
      setReviews([data[0], ...reviews]);
    }
    setForm({ name: "", rating: 0, service: "", text: "" });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 2800);
  };

  const toggleHelpful = async (id, currentHelpful) => {
    if (votedIds.includes(id)) return;
    const newCount = currentHelpful + 1;
    setReviews(reviews.map(r => r.id === id ? { ...r, helpful: newCount } : r));
    setVotedIds([...votedIds, id]);
    await api(`reviews?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ helpful: newCount }) });
  };

  const loginAdmin = () => {
    if (adminPass === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminError("");
    } else {
      setAdminError("Incorrect password.");
    }
  };

  const ratingDist = [5,4,3,2,1].map(n => ({
    n, count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length ? Math.round(reviews.filter(r => r.rating === n).length / reviews.length * 100) : 0,
  }));

  if (isAdmin) return <AdminPanel onExit={() => setIsAdmin(false)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: BODY, color: "#1a1a1a" }}>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg,#1a0533 0%,#2d0a5e 50%,#1a0533 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.015) 0px,rgba(255,255,255,0.015) 1px,transparent 1px,transparent 8px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "44px 24px 38px" }}>
          <h1 style={{ fontFamily: HEAD, fontSize: "clamp(36px,9vw,80px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 3, color: "#fff", margin: "0 0 8px", lineHeight: 0.95, textShadow: "3px 3px 0 rgba(0,0,0,0.4)" }}>
            TAROT SPOT
          </h1>
          <p style={{ fontFamily: HEAD, fontSize: "clamp(12px,3vw,17px)", textTransform: "uppercase", letterSpacing: 4, color: LAV, margin: 0 }}>
            CLIENT REVIEWS
          </p>
        </div>
      </div>

      {/* RATING SUMMARY */}
      <div style={{ background: "#f7f7f7", borderBottom: "3px solid #eee", padding: "28px 20px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", minWidth: 110 }}>
            <div style={{ fontFamily: HEAD, fontSize: 58, fontWeight: 900, color: "#1a1a1a", lineHeight: 1 }}>{avg(reviews)}</div>
            <div style={{ margin: "6px 0 4px" }}><Stars n={Math.round(parseFloat(avg(reviews)))} size={20} /></div>
            <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{reviews.length} reviews</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            {ratingDist.map(({ n, count, pct }) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "#555", width: 12, textAlign: "right" }}>{n}</span>
                <span style={{ fontSize: 12, color: "#e6a817" }}>★</span>
                <div style={{ flex: 1, height: 8, background: "#e8e8e8", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: LAV, borderRadius: 4, transition: "width 0.5s" }} />
                </div>
                <span style={{ fontSize: 11, color: "#999", width: 18 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 20px 60px" }}>
        <h2 style={{ fontFamily: HEAD, fontSize: "clamp(20px,5vw,34px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, color: "#1a1a1a", margin: "0 0 20px", borderBottom: "3px solid #1a1a1a", paddingBottom: 8 }}>
          WHAT CLIENTS ARE SAYING
        </h2>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <select style={{ border: "2px solid #ddd", padding: "8px 12px", fontSize: 13, fontFamily: BODY, background: "#fff", color: "#333", cursor: "pointer" }} value={filterService} onChange={e => setFilterService(e.target.value)}>
            <option value="All">All Services</option>
            {SERVICES.map(sv => <option key={sv}>{sv}</option>)}
          </select>
          <div style={{ display: "flex" }}>
            {[["newest","Newest"],["highest","Top Rated"],["helpful","Most Helpful"]].map(([val, label]) => (
              <button key={val} onClick={() => setSort(val)} style={{ padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: BODY, fontWeight: sort === val ? 700 : 400, background: sort === val ? "#1a1a1a" : "#fff", color: sort === val ? "#fff" : "#555", border: "2px solid #1a1a1a", marginLeft: -2, transition: "all 0.15s" }}>{label}</button>
            ))}
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ ...ctaBtn(showForm ? "#888" : LAV, showForm ? "#666" : LAV_DARK), marginLeft: "auto" }}>
            {showForm ? "✕ CANCEL" : "+ WRITE A REVIEW"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ border: "2px solid #1a1a1a", padding: 24, marginBottom: 24, background: "#fafafa" }}>
            <h3 style={{ fontFamily: HEAD, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 18px", fontSize: 18 }}>SHARE YOUR EXPERIENCE</h3>
            {submitted ? (
              <div style={{ textAlign: "center", padding: 20, color: LAV_DARK, fontFamily: HEAD, fontSize: 15, textTransform: "uppercase", letterSpacing: 2 }}>✓ YOUR REVIEW HAS BEEN POSTED. THANK YOU!</div>
            ) : (
              <>
                <label style={labelSt}>Your Name</label>
                <input style={inputSt} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="First name or initials" />

                <label style={labelSt}>Your Rating</label>
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 32, padding: 0, lineHeight: 1, color: n <= (hoverRating || form.rating) ? "#e6a817" : "#ddd" }}
                      onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} onClick={() => setForm({ ...form, rating: n })}>★</button>
                  ))}
                </div>

                <label style={labelSt}>Service Received</label>
                <select style={selectSt} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                  <option value="">Select a service…</option>
                  {SERVICES.map(sv => <option key={sv}>{sv}</option>)}
                </select>

                <label style={labelSt}>Your Review</label>
                <textarea style={textareaSt} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} placeholder="Share what your experience was like…" />

                <button onClick={submitReview} disabled={submitting} style={{ ...ctaBtn(), opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "POSTING…" : "POST REVIEW →"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Admin login modal */}
        {showAdminLogin && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", padding: 32, width: 320, border: "3px solid #1a0533" }}>
              <div style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>ADMIN LOGIN</div>
              <label style={labelSt}>Password</label>
              <input type="password" style={inputSt} value={adminPass} onChange={e => setAdminPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loginAdmin()} placeholder="Enter admin password" autoFocus />
              {adminError && <div style={{ color: "#c0392b", fontSize: 12, marginBottom: 10 }}>{adminError}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={loginAdmin} style={ctaBtn()}>ENTER</button>
                <button onClick={() => { setShowAdminLogin(false); setAdminPass(""); setAdminError(""); }} style={{ ...ctaBtn("#888", "#666") }}>CANCEL</button>
              </div>
            </div>
          </div>
        )}

        {/* Review cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "#aaa", fontSize: 14 }}>Loading reviews…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#999", fontSize: 14 }}>No reviews yet — be the first!</div>
        ) : filtered.map(r => (
          <div key={r.id} style={{ borderTop: "3px solid #1a1a1a", borderBottom: "1px solid #eee", padding: "20px 0", marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${LAV},#1a0533)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: "#fff", flexShrink: 0, fontFamily: HEAD }}>
                {r.name[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 2 }}>{r.name}</div>
                <div style={{ display: "flex", gap: 2, marginBottom: 2 }}><Stars n={r.rating} size={13} /></div>
                <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>
                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
            <div style={{ display: "inline-block", background: "#1a0533", color: "#fff", fontSize: 9, fontFamily: HEAD, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, padding: "3px 10px", marginBottom: 10 }}>
              {r.service || "General"}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#333", margin: "0 0 14px" }}>{r.review_text}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => toggleHelpful(r.id, r.helpful)} style={{ padding: "6px 16px", background: votedIds.includes(r.id) ? LAV : "#fff", color: votedIds.includes(r.id) ? "#fff" : "#555", border: `2px solid ${votedIds.includes(r.id) ? LAV : "#ddd"}`, fontSize: 11, fontFamily: BODY, cursor: votedIds.includes(r.id) ? "default" : "pointer", fontWeight: votedIds.includes(r.id) ? 700 : 400, transition: "all 0.15s", boxShadow: votedIds.includes(r.id) ? `0 2px 0 ${LAV_DARK}` : "none" }}>
                {votedIds.includes(r.id) ? "✓ Helpful" : "Helpful"} · {r.helpful}
              </button>
              {votedIds.includes(r.id) && <span style={{ fontSize: 11, color: "#999" }}>Thanks for your feedback</span>}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ background: "#1a0533", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: HEAD, fontSize: "clamp(20px,5vw,36px)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 3, color: "#fff", marginBottom: 16 }}>
          BOOK A READING
        </div>
        <a href="https://thetarotspot.com" style={{ display: "inline-block", background: LAV, color: "#fff", padding: "13px 32px", fontSize: 13, fontFamily: HEAD, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, textDecoration: "none", boxShadow: `0 4px 0 ${LAV_DARK}` }}>
          VISIT THETAROTSPOT.COM →
        </a>
        {/* Hidden admin access */}
        <div style={{ marginTop: 24 }}>
          <button onClick={() => setShowAdminLogin(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 10, cursor: "pointer", fontFamily: BODY, letterSpacing: 1 }}>
            admin
          </button>
        </div>
      </div>
    </div>
  );
}
