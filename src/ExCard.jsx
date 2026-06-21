import { freshEx, prevLabel, FEELS, FS } from './data';

export default function ExCard({ex, exData, hist, isOpen, onOpen, onDone, onSet, onFeel, onNote, onFill}) {
  const d   = exData || freshEx();
  const prev = prevLabel(hist, ex.isTime); // {text, date, pr} | null
  const ps  = (Array.isArray(hist) ? hist[hist.length-1]?.sets : hist?.sets) || [];

  const tS  = ex.type === "core"
    ? {bg:"#FAEEDA", bo:"#FAC775", co:"#854F0B"}
    : {bg:"#E6F1FB", bo:"#85B7EB", co:"#185FA5"};

  return (
    <div style={{background:"#fff",border:"1px solid rgba(0,0,0,0.09)",borderRadius:12,
      marginBottom:8,overflow:"hidden"}}>

      {/* Header */}
      <div onClick={onOpen}
        style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",
          cursor:"pointer",userSelect:"none"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:14,fontWeight:500,color:"#1a1a1a"}}>{ex.name}</span>
            {prev?.pr && (
              <span style={{fontSize:9,fontWeight:700,color:"#854F0B",
                background:"#FAEEDA",borderRadius:4,padding:"1px 5px",
                border:"1px solid #FAC775",letterSpacing:"0.04em"}}>PR</span>
            )}
          </div>
          <div style={{fontSize:12,color:"#666",marginTop:2}}>{ex.target}</div>
          {!isOpen && prev && (
            <div style={{fontSize:11,color:"#1D9E75",marginTop:3}}>
              Last{prev.date?` (${prev.date})`:""}: {prev.text}
            </div>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <div
            onClick={e=>{e.stopPropagation();onDone();}}
            style={{width:28,height:28,borderRadius:"50%",
              border:d.done?"1px solid #1D9E75":"1px solid rgba(0,0,0,0.18)",
              background:d.done?"#E1F5EE":"#f5f5f3",
              display:"flex",alignItems:"center",justifyContent:"center",
              cursor:"pointer",color:d.done?"#1D9E75":"#bbb",fontSize:14,fontWeight:700}}>
            ✓
          </div>
          <span style={{fontSize:11,color:"#bbb",display:"inline-block",
            transition:"transform 0.2s",transform:isOpen?"rotate(180deg)":"none"}}>▼</span>
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div style={{padding:"0 14px 14px",borderTop:"1px solid rgba(0,0,0,0.07)"}}>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"10px 0 8px"}}>
            <span style={{fontSize:11,fontWeight:500,padding:"3px 9px",borderRadius:6,
              background:tS.bg,border:`1px solid ${tS.bo}`,color:tS.co}}>
              {ex.type==="core"?"Core":"Strength"}
            </span>
            {ex.settings && (
              <span style={{fontSize:11,padding:"3px 9px",borderRadius:6,
                background:"#f5f5f3",border:"1px solid rgba(0,0,0,0.1)",color:"#555"}}>
                {ex.settings}
              </span>
            )}
          </div>

          <div style={{fontSize:12,color:"#185FA5",background:"#E6F1FB",
            border:"1px solid #B5D4F4",borderRadius:8,padding:"8px 10px",
            marginBottom:12,lineHeight:1.5}}>
            {ex.tip}
          </div>

          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:"42px 1fr 1fr",
            gap:"4px 6px",marginBottom:6,alignItems:"center"}}>
            <div/>
            <div style={{fontSize:10,fontWeight:600,color:"#1D9E75",
              textTransform:"uppercase",letterSpacing:"0.04em"}}>
              {prev?.date?`Last (${prev.date})`:"Last"} — tap to fill
            </div>
            <div style={{fontSize:10,fontWeight:600,color:"#aaa",
              textTransform:"uppercase",letterSpacing:"0.04em"}}>
              {ex.isTime?"Seconds":"lb  ×  reps"}
            </div>
          </div>

          {/* Set rows */}
          {Array.from({length:ex.sets},(_,i)=>{
            const sv   = (d.sets||[])[i] || {w:"",r:""};
            const p    = ps[i] || {};
            const pl   = p.w ? (ex.isTime?`${p.w}s`:`${p.w}lb${p.r?"×"+p.r:""}`) : "—";
            return (
              <div key={i} style={{display:"grid",gridTemplateColumns:"42px 1fr 1fr",
                gap:"4px 6px",alignItems:"center",marginBottom:7}}>
                <span style={{fontSize:12,color:"#aaa"}}>Set {i+1}</span>
                <div onClick={()=>onFill(i,p)}
                  style={{fontSize:13,fontWeight:500,
                    color:p.w?"#0F6E56":"#ccc",
                    background:p.w?"#E1F5EE":"transparent",
                    borderRadius:6,padding:"6px 8px",
                    cursor:p.w?"pointer":"default",
                    border:p.w?"1px solid #5DCAA5":"1px solid transparent",
                    userSelect:"none",minHeight:32,display:"flex",alignItems:"center"}}>
                  {pl}
                </div>
                {ex.isTime ? (
                  <input type="number" inputMode="numeric" placeholder="sec"
                    value={sv.w||""}
                    onChange={e=>onSet(i,"w",e.target.value)}
                    style={{padding:"7px 10px",borderRadius:8,
                      border:"1px solid rgba(0,0,0,0.18)",
                      background:"#fff",color:"#1a1a1a",width:"100%",fontFamily:"inherit"}}
                  />
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <input type="number" inputMode="decimal" placeholder="lb"
                      value={sv.w||""}
                      onChange={e=>onSet(i,"w",e.target.value)}
                      style={{padding:"7px 8px",borderRadius:8,
                        border:"1px solid rgba(0,0,0,0.18)",
                        background:"#fff",color:"#1a1a1a",width:"60px",fontFamily:"inherit"}}
                    />
                    <span style={{fontSize:12,color:"#ccc"}}>×</span>
                    <input type="number" inputMode="numeric" placeholder="reps"
                      value={sv.r||""}
                      onChange={e=>onSet(i,"r",e.target.value)}
                      style={{padding:"7px 8px",borderRadius:8,
                        border:"1px solid rgba(0,0,0,0.18)",
                        background:"#fff",color:"#1a1a1a",width:"56px",fontFamily:"inherit"}}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Feel */}
          <div style={{fontSize:10,fontWeight:600,color:"#bbb",
            textTransform:"uppercase",letterSpacing:"0.05em",margin:"10px 0 6px"}}>
            How did it feel?
          </div>
          <div style={{display:"flex",gap:6}}>
            {FEELS.map(f=>{
              const fs=FS[f], sel=d.feel===f;
              return (
                <button key={f} onClick={()=>onFeel(f)}
                  style={{flex:1,padding:"8px 4px",borderRadius:8,
                    border:sel?`1px solid ${fs.bo}`:"1px solid rgba(0,0,0,0.11)",
                    background:sel?fs.bg:"#f5f5f3",
                    color:sel?fs.co:"#777",fontSize:12,cursor:"pointer"}}>
                  {f}
                </button>
              );
            })}
          </div>

          {/* Note */}
          <div style={{fontSize:10,fontWeight:600,color:"#bbb",
            textTransform:"uppercase",letterSpacing:"0.05em",margin:"10px 0 4px"}}>
            Notes
          </div>
          <textarea rows={2}
            placeholder="Weight changes, machine settings, how it felt..."
            value={d.note||""}
            onChange={e=>onNote(e.target.value)}
            style={{width:"100%",padding:"9px 10px",borderRadius:8,
              border:"1px solid rgba(0,0,0,0.18)",background:"#fff",
              color:"#1a1a1a",resize:"none",fontFamily:"inherit",lineHeight:1.5}}
          />
        </div>
      )}
    </div>
  );
}
