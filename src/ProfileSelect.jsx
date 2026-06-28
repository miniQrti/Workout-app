import { useState } from "react";

const COLORS = ["#1D9E75","#185FA5","#854F0B","#6B5CE7","#C53030","#B45309"];

const LS = {
  get(k)    { try { return localStorage.getItem(k);     } catch(_) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v);         } catch(_) {} },
  del(k)    { try { localStorage.removeItem(k);          } catch(_) {} },
};

export function getProfiles() {
  try { return JSON.parse(LS.get('wt-profiles') || '[]'); } catch(_) { return []; }
}
function saveProfiles(arr) { LS.set('wt-profiles', JSON.stringify(arr)); }

function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── Pin dots indicator ──────────────────────────────────────────────────────
function PinDots({ count, error }) {
  return (
    <div style={{display:"flex",gap:14,justifyContent:"center",margin:"22px 0 18px"}}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{
          width:13, height:13, borderRadius:"50%",
          background: error ? "#C53030" : i < count ? "#1a1a1a" : "transparent",
          border: `1.5px solid ${error ? "#C53030" : i < count ? "#1a1a1a" : "rgba(0,0,0,0.28)"}`,
          transition:"background 0.15s",
        }}/>
      ))}
    </div>
  );
}

// ── Numeric PIN pad ─────────────────────────────────────────────────────────
function PinPad({ onDigit, onDelete }) {
  const keys = [1,2,3,4,5,6,7,8,9,null,0,'⌫'];
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:264,margin:"0 auto"}}>
      {keys.map((k, i) => (
        <button key={i}
          onClick={() => k === '⌫' ? onDelete() : k !== null && onDigit(String(k))}
          disabled={k === null}
          style={{
            height:62, borderRadius:14, fontSize:k==='⌫'?20:22, fontWeight:k==='⌫'?400:400,
            border: k === null ? "none" : "1px solid rgba(0,0,0,0.11)",
            background: k === null ? "transparent" : "#f5f5f3",
            color:"#1a1a1a", cursor: k === null ? "default" : "pointer",
            visibility: k === null ? "hidden" : "visible",
          }}>
          {k}
        </button>
      ))}
    </div>
  );
}

// ── PIN entry for existing protected profile ─────────────────────────────────
function PinEntry({ profile, onSuccess, onCancel }) {
  const [pin,   setPin]   = useState("");
  const [error, setError] = useState(false);

  function addDigit(d) {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === profile.pin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 700);
      }
    }
  }

  return (
    <div style={{padding:"40px 24px 32px",textAlign:"center"}}>
      <div style={{
        width:68, height:68, borderRadius:"50%", margin:"0 auto 14px",
        background:profile.color, display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:24, fontWeight:700, color:"#fff",
      }}>
        {initials(profile.name)}
      </div>
      <div style={{fontSize:18,fontWeight:600,color:"#1a1a1a"}}>{profile.name}</div>
      <div style={{fontSize:13,color:"#aaa",marginTop:4}}>Enter your PIN</div>
      <PinDots count={pin.length} error={error}/>
      {error && <div style={{fontSize:13,color:"#C53030",marginBottom:8,marginTop:-10}}>Incorrect PIN</div>}
      <PinPad onDigit={addDigit} onDelete={() => { setPin(p => p.slice(0,-1)); setError(false); }}/>
      <button onClick={onCancel}
        style={{marginTop:22,background:"none",border:"none",color:"#aaa",
          fontSize:14,cursor:"pointer",padding:"8px 20px"}}>
        Cancel
      </button>
    </div>
  );
}

// ── Create new profile ───────────────────────────────────────────────────────
function CreateProfile({ onCreated, onCancel, hasLegacyData }) {
  const [step,      setStep]     = useState("name"); // "name"|"pin"|"confirm"
  const [name,      setName]     = useState("");
  const [colorIdx,  setColorIdx] = useState(0);
  const [pin,       setPin]      = useState("");
  const [confirm,   setConfirm]  = useState("");
  const [pinError,  setPinError] = useState(false);

  function addDigit(d) {
    if (step === "pin") {
      if (pin.length >= 4) return;
      const next = pin + d;
      setPin(next);
      if (next.length === 4) setStep("confirm");
    } else {
      if (confirm.length >= 4) return;
      const next = confirm + d;
      setConfirm(next);
      if (next.length === 4) {
        if (next === pin) {
          doCreate(pin);
        } else {
          setPinError(true);
          setTimeout(() => { setConfirm(""); setPin(""); setStep("pin"); setPinError(false); }, 700);
        }
      }
    }
  }

  function doCreate(pinVal) {
    const id = Math.random().toString(36).slice(2,10) + Date.now().toString(36);
    const profile = { id, name: name.trim(), pin: pinVal, color: COLORS[colorIdx], createdAt: Date.now() };
    const profiles = getProfiles();
    profiles.push(profile);
    saveProfiles(profiles);
    // Migrate legacy data into this profile's slot on first-ever profile creation
    if (profiles.length === 1 && hasLegacyData) {
      const old = LS.get('kurt-wt-v4');
      if (old) LS.set(`kurt-wt-v4-${id}`, old);
    }
    onCreated(profile);
  }

  if (step === "name") {
    return (
      <div style={{padding:"40px 24px 32px"}}>
        <div style={{fontSize:22,fontWeight:700,color:"#1a1a1a",marginBottom:4}}>New profile</div>
        <div style={{fontSize:14,color:"#999",marginBottom:28}}>Who is this profile for?</div>

        {/* Avatar preview */}
        <div style={{
          width:72, height:72, borderRadius:"50%", margin:"0 auto 20px",
          background:COLORS[colorIdx], display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:26, fontWeight:700, color:"#fff",
        }}>
          {name.trim() ? initials(name) : "?"}
        </div>

        {/* Color picker */}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:24}}>
          {COLORS.map((c, i) => (
            <div key={i} onClick={() => setColorIdx(i)} style={{
              width:30, height:30, borderRadius:"50%", background:c, cursor:"pointer",
              outline: colorIdx === i ? `3px solid ${c}` : "3px solid transparent",
              outlineOffset:2,
            }}/>
          ))}
        </div>

        <input type="text" placeholder="Name" value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && name.trim() && setStep("pin")}
          autoFocus
          style={{width:"100%",padding:"13px 14px",borderRadius:10,boxSizing:"border-box",
            border:"1px solid rgba(0,0,0,0.18)",background:"#fff",
            color:"#1a1a1a",fontSize:16,fontFamily:"inherit"}}
        />

        <button onClick={() => setStep("pin")} disabled={!name.trim()}
          style={{width:"100%",marginTop:14,padding:"13px",fontSize:15,fontWeight:600,
            borderRadius:12,border:"none",
            background:name.trim()?"#1D9E75":"#e0e0e0",
            color:name.trim()?"#fff":"#aaa",cursor:name.trim()?"pointer":"default"}}>
          Continue
        </button>

        {hasLegacyData && (
          <div style={{marginTop:14,padding:"10px 12px",background:"#E6F1FB",
            border:"1px solid #B5D4F4",borderRadius:8,
            fontSize:12,color:"#185FA5",lineHeight:1.5,textAlign:"center"}}>
            Your existing workout data will be carried over to this profile
          </div>
        )}

        {onCancel && (
          <button onClick={onCancel}
            style={{width:"100%",marginTop:8,padding:"10px",fontSize:14,
              background:"none",border:"none",color:"#aaa",cursor:"pointer"}}>
            Cancel
          </button>
        )}
      </div>
    );
  }

  const current = step === "pin" ? pin : confirm;
  return (
    <div style={{padding:"40px 24px 32px",textAlign:"center"}}>
      <div style={{fontSize:18,fontWeight:600,color:"#1a1a1a"}}>
        {step === "pin" ? "Set a PIN" : "Confirm PIN"}
      </div>
      <div style={{fontSize:13,color:"#aaa",marginTop:4}}>
        {step === "pin" ? "Optional 4-digit PIN to protect your profile" : "Re-enter your PIN to confirm"}
      </div>
      {pinError && <div style={{fontSize:13,color:"#C53030",marginTop:8}}>PINs don't match — try again</div>}
      <PinDots count={current.length} error={pinError}/>
      <PinPad onDigit={addDigit} onDelete={() => {
        if (step === "pin") setPin(p => p.slice(0,-1));
        else setConfirm(p => p.slice(0,-1));
      }}/>
      {step === "pin" && (
        <button onClick={() => doCreate(null)}
          style={{marginTop:18,background:"none",border:"none",
            color:"#aaa",fontSize:14,cursor:"pointer",padding:"8px 20px"}}>
          Skip — no PIN
        </button>
      )}
    </div>
  );
}

// ── Main profile picker ──────────────────────────────────────────────────────
export default function ProfileSelect({ onSelect }) {
  const [profiles,   setProfiles]   = useState(getProfiles);
  const [mode,       setMode]       = useState(() => getProfiles().length === 0 ? "create" : "list");
  const [pinTarget,  setPinTarget]  = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const hasLegacyData = !!LS.get('kurt-wt-v4');

  function handleSelect(profile) {
    if (editMode) return;
    if (profile.pin) setPinTarget(profile);
    else onSelect(profile);
  }

  function handleCreated(profile) {
    setProfiles(getProfiles());
    onSelect(profile);
  }

  function deleteProfile(id) {
    const updated = profiles.filter(p => p.id !== id);
    saveProfiles(updated);
    LS.del(`kurt-wt-v4-${id}`);
    setProfiles(updated);
    setConfirmDel(null);
    if (updated.length === 0) { setEditMode(false); setMode("create"); }
  }

  const wrap = children => (
    <div style={{background:"#f9f9f7",minHeight:"100vh",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif"}}>
      {children}
    </div>
  );

  if (mode === "create") return wrap(
    <CreateProfile
      onCreated={handleCreated}
      onCancel={profiles.length > 0 ? () => setMode("list") : undefined}
      hasLegacyData={hasLegacyData && profiles.length === 0}
    />
  );

  if (pinTarget) return wrap(
    <PinEntry
      profile={pinTarget}
      onSuccess={() => onSelect(pinTarget)}
      onCancel={() => setPinTarget(null)}
    />
  );

  return wrap(
    <div style={{padding:"48px 20px 32px"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28}}>
        <div>
          <div style={{fontSize:26,fontWeight:700,color:"#1a1a1a",lineHeight:1.2}}>
            Who's working out?
          </div>
          <div style={{fontSize:14,color:"#999",marginTop:4}}>Select your profile</div>
        </div>
        {profiles.length > 0 && (
          <button onClick={() => { setEditMode(e => !e); setConfirmDel(null); }}
            style={{background:"none",border:"none",color:editMode?"#C53030":"#aaa",
              fontSize:14,cursor:"pointer",padding:"4px 0",marginTop:4,fontWeight:editMode?600:400}}>
            {editMode ? "Done" : "Edit"}
          </button>
        )}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {profiles.map(p => (
          <div key={p.id}>
            <button onClick={() => handleSelect(p)}
              style={{display:"flex",alignItems:"center",gap:14,
                background:"#fff",border:"1px solid rgba(0,0,0,0.09)",
                borderRadius:16,padding:"14px 16px",cursor:editMode?"default":"pointer",
                textAlign:"left",width:"100%",opacity:editMode?0.75:1}}>
              <div style={{
                width:48,height:48,borderRadius:"50%",background:p.color,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:18,fontWeight:700,color:"#fff",flexShrink:0,
              }}>
                {initials(p.name)}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:600,color:"#1a1a1a"}}>{p.name}</div>
                {p.pin && <div style={{fontSize:12,color:"#aaa",marginTop:2}}>PIN protected</div>}
              </div>
              {editMode ? (
                <button onClick={e => { e.stopPropagation(); setConfirmDel(p.id); }}
                  style={{width:28,height:28,borderRadius:"50%",background:"#FEE2E2",
                    border:"1px solid #FCA5A5",color:"#C53030",fontSize:16,
                    cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                    flexShrink:0}}>
                  −
                </button>
              ) : (
                <span style={{fontSize:18,color:"#ddd"}}>›</span>
              )}
            </button>
            {confirmDel === p.id && (
              <div style={{background:"#FEE2E2",border:"1px solid #FCA5A5",borderRadius:10,
                padding:"12px 14px",marginTop:4,display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,fontSize:13,color:"#C53030",lineHeight:1.4}}>
                  Delete {p.name}'s profile and all their workout data?
                </div>
                <button onClick={() => setConfirmDel(null)}
                  style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(0,0,0,0.15)",
                    background:"#fff",color:"#555",fontSize:13,cursor:"pointer"}}>
                  Cancel
                </button>
                <button onClick={() => deleteProfile(p.id)}
                  style={{padding:"6px 12px",borderRadius:8,border:"none",
                    background:"#C53030",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={() => { setEditMode(false); setMode("create"); }}
        style={{display:"flex",alignItems:"center",gap:14,marginTop:10,
          background:"none",border:"2px dashed rgba(0,0,0,0.13)",
          borderRadius:16,padding:"14px 16px",cursor:"pointer",
          textAlign:"left",width:"100%"}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:"#f0f0ee",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:22,color:"#bbb",flexShrink:0}}>
          +
        </div>
        <div style={{fontSize:15,fontWeight:500,color:"#999"}}>Add profile</div>
      </button>
    </div>
  );
}
