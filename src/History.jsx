import { useState } from "react";
import { DAYS, allTimeBest } from './data';

// Simple SVG line chart — best weight per session
function MiniChart({sessions, isTime}) {
  const points = sessions
    .map(s => {
      const weights = (s.sets||[]).map(x=>parseFloat(x.w)).filter(n=>!isNaN(n)&&n>0);
      return {date: s.date, val: weights.length ? Math.max(...weights) : null, pr: s.pr};
    })
    .filter(p => p.val !== null);

  if (points.length < 2) {
    return (
      <div style={{fontSize:11,color:"#bbb",padding:"10px 0 4px"}}>
        Log more sessions to see your chart
      </div>
    );
  }

  const W = 280, H = 52, PAD = 10;
  const vals = points.map(p=>p.val);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max === min ? 1 : max - min;
  const xOf  = i => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const yOf  = v => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const poly = points.map((p,i)=>`${xOf(i)},${yOf(p.val)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} style={{width:"100%",overflow:"visible",display:"block"}}>
      {/* Baseline */}
      <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke="#f0f0ee" strokeWidth="1"/>
      {/* Line */}
      <polyline points={poly} fill="none" stroke="#1D9E75" strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round"/>
      {/* Dots */}
      {points.map((p,i)=>(
        <circle key={i} cx={xOf(i)} cy={yOf(p.val)} r="4"
          fill={p.pr?"#FAC775":"#1D9E75"} stroke="white" strokeWidth="1.5"/>
      ))}
      {/* Axis labels */}
      <text x={xOf(0)} y={H+14} fontSize="9" fill="#bbb" textAnchor="start">{points[0].date}</text>
      <text x={xOf(points.length-1)} y={H+14} fontSize="9" fill="#bbb" textAnchor="end">
        {points[points.length-1].date}
      </text>
      {/* Best weight label */}
      <text x={W-PAD} y={yOf(max)-5} fontSize="9" fill="#1D9E75" textAnchor="end">
        {isTime ? `${max}s` : `${max}lb`}
      </text>
      {min !== max && (
        <text x={W-PAD} y={yOf(min)+12} fontSize="9" fill="#bbb" textAnchor="end">
          {isTime ? `${min}s` : `${min}lb`}
        </text>
      )}
    </svg>
  );
}

function SessionRow({s, isTime, index}) {
  const best = Math.max(...(s.sets||[]).map(x=>parseFloat(x.w)||0).filter(Boolean));
  const label = (s.sets||[])
    .filter(x=>x?.w)
    .map(x => isTime ? `${x.w}s` : `${x.w}lb${x.r?"×"+x.r:""}`)
    .join(" · ");

  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:10,
      padding:"9px 0",borderBottom:"1px solid rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:11,color:"#bbb",width:32,flexShrink:0,paddingTop:1}}>#{index+1}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,color:"#555",lineHeight:1.5}}>{label || "—"}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",flexShrink:0,gap:2}}>
        <div style={{fontSize:11,color:"#aaa"}}>{s.date}</div>
        {s.pr && (
          <span style={{fontSize:9,fontWeight:700,color:"#854F0B",
            background:"#FAEEDA",borderRadius:4,padding:"1px 5px",
            border:"1px solid #FAC775",letterSpacing:"0.04em"}}>PR</span>
        )}
      </div>
    </div>
  );
}

function ExerciseHistory({ex, sessions}) {
  const [expanded, setExpanded] = useState(false);
  const best = allTimeBest(sessions, ex.isTime);
  const last = sessions?.[sessions.length - 1];
  const lastIsPR = last?.pr;
  const count = sessions?.length || 0;

  return (
    <div style={{background:"#fff",border:"1px solid rgba(0,0,0,0.09)",
      borderRadius:12,marginBottom:8,overflow:"hidden"}}>
      {/* Header */}
      <div onClick={()=>setExpanded(e=>!e)}
        style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",
          cursor:"pointer",userSelect:"none"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:14,fontWeight:500,color:"#1a1a1a"}}>{ex.name}</span>
            {lastIsPR && (
              <span style={{fontSize:9,fontWeight:700,color:"#854F0B",
                background:"#FAEEDA",borderRadius:4,padding:"1px 5px",
                border:"1px solid #FAC775",letterSpacing:"0.04em"}}>PR</span>
            )}
          </div>
          <div style={{fontSize:12,color:"#aaa",marginTop:2}}>
            {count === 0
              ? "No sessions yet"
              : best
                ? `Best: ${best.w}${best.unit} · ${count} session${count!==1?"s":""}`
                : `${count} session${count!==1?"s":""}`
            }
          </div>
        </div>
        <span style={{fontSize:11,color:"#bbb",transition:"transform 0.2s",
          transform:expanded?"rotate(180deg)":"none",flexShrink:0}}>▼</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{padding:"0 14px 14px",borderTop:"1px solid rgba(0,0,0,0.07)"}}>
          {count === 0 ? (
            <div style={{fontSize:13,color:"#aaa",padding:"12px 0"}}>
              No sessions logged yet. Complete this exercise and tap "Save as last session" to start tracking.
            </div>
          ) : (
            <>
              <div style={{margin:"12px 0 4px"}}>
                <MiniChart sessions={sessions} isTime={ex.isTime}/>
              </div>
              <div style={{fontSize:10,fontWeight:600,color:"#bbb",
                textTransform:"uppercase",letterSpacing:"0.08em",margin:"12px 0 4px"}}>
                Session log
              </div>
              {[...sessions].reverse().map((s,i)=>(
                <SessionRow key={i} s={s} isTime={ex.isTime} index={sessions.length-1-i}/>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function History({store}) {
  const [day, setDay] = useState("a");
  const D = DAYS[day];

  const tabSt = dk => ({
    flex:1, padding:"9px 4px", borderRadius:8, cursor:"pointer",
    lineHeight:1.4, textAlign:"center", whiteSpace:"pre-line",
    fontSize:12, fontWeight:day===dk?600:500,
    border:day===dk?"1px solid rgba(0,0,0,0.22)":"1px solid rgba(0,0,0,0.1)",
    background:day===dk?"#f0f0ee":"#fff",
    color:day===dk?"#111":"#777",
  });

  return (
    <div style={{background:"#f9f9f7",minHeight:"100vh"}}>
      {/* Sticky header */}
      <div style={{background:"#f9f9f7",padding:"16px 16px 0",
        position:"sticky",top:0,zIndex:10}}>
        <div style={{fontSize:20,fontWeight:600,color:"#1a1a1a",marginBottom:12}}>
          History
        </div>
        <div style={{display:"flex",gap:8,marginBottom:4}}>
          {["a","b","c"].map(dk=>(
            <button key={dk} onClick={()=>setDay(dk)} style={tabSt(dk)}>
              {dk==="a"?"Day A\nUpper":dk==="b"?"Day B\nLower":"Day C\nFull body"}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"12px 16px 100px"}}>
        <div style={{fontSize:16,fontWeight:600,color:"#1a1a1a",marginBottom:12}}>
          {D.title}
        </div>

        <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",
          textTransform:"uppercase",color:"#bbb",marginBottom:8}}>Strength</div>
        {D.exercises.filter(e=>e.type==="strength").map(ex=>(
          <ExerciseHistory
            key={ex.id}
            ex={ex}
            sessions={store.history?.[ex.id] || []}
          />
        ))}

        <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.08em",
          textTransform:"uppercase",color:"#bbb",margin:"18px 0 8px"}}>Core</div>
        {D.exercises.filter(e=>e.type==="core").map(ex=>(
          <ExerciseHistory
            key={ex.id}
            ex={ex}
            sessions={store.history?.[ex.id] || []}
          />
        ))}
      </div>
    </div>
  );
}
