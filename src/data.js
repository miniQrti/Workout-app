export const DAYS = {
  a: {
    title: "Day A — upper body + core",
    warmup: "Arm circles, chest openers, shoulder rolls, neck side stretch, wrist rotations",
    cooldown: "Cross-body shoulder stretch, chest doorway stretch, tricep overhead stretch, wrist flexor/extensor stretch, neck release",
    cardio: "Stationary bike or treadmill walk",
    cardioNote: "Heart rate ~60–70% max. Conversational pace.",
    exercises: [
      {id:"a1", name:"Chest press machine",    target:"3 × 10–12 reps",        settings:"Seat: 3",                        tip:"Big compound push. Full range, controlled lowering.",                                                       sets:3, type:"strength"},
      {id:"a2", name:"Seated row machine",      target:"3 × 10–12 reps",        settings:"Chest pad: 5 / Seat: 5",         tip:"Pull shoulder blades together at peak. Lower back stays neutral.",                                         sets:3, type:"strength"},
      {id:"a3", name:"Shoulder press machine",  target:"3 × 10–12 reps",        settings:"Seat: 4",                        tip:"Don't lock elbows at the top — keep tension on deltoids.",                                                sets:3, type:"strength"},
      {id:"a4", name:"Cable curls — rope",      target:"3 × 12 reps",           settings:"",                               tip:"Palms face up at peak, rotate naturally on the way down. Wrist-friendly replacement for bicep curl machine.", sets:3, type:"strength"},
      {id:"a5", name:"Tricep pushdown — cable", target:"3 × 12 reps",           settings:"",                               tip:"Elbows pinned to sides. Full extension at bottom, controlled return.",                                       sets:3, type:"strength"},
      {id:"a6", name:"Lat pulldown machine",    target:"3 × 10–12 reps",        settings:"",                               tip:"Pull to upper chest. Second pull movement for lats and upper back.",                                        sets:3, type:"strength"},
      {id:"a7", name:"Plank hold",              target:"3 sets × 50 sec",       settings:"",                               tip:"Anti-extension. Hips level, glutes squeezed, breathe steadily.",                                           sets:3, type:"core", isTime:true},
      {id:"a8", name:"Ab crunch machine",       target:"3 × 15 reps",           settings:"",                               tip:"Flexion pattern. Slow and controlled — pause at peak contraction.",                                         sets:3, type:"core"},
    ]
  },
  b: {
    title: "Day B — lower body + core",
    warmup: "Hip circles, leg swings (front/back + side), seated hip flexor stretch, ankle rotations, bodyweight squat × 10",
    cooldown: "Seated hamstring stretch, standing quad stretch, hip flexor lunge stretch, seated glute/piriformis stretch, calf stretch against wall",
    cardio: "Stationary bike (preferred after leg day)",
    cardioNote: "Low resistance, easy cadence. Heart rate ~60–70% max.",
    exercises: [
      {id:"b1", name:"Leg press machine",       target:"4 × 10–12 reps",        settings:"Seat: 4",                        tip:"Biggest compound movement — worth the extra set. Don't lock knees at the top.",                              sets:4, type:"strength"},
      {id:"b2", name:"Seated leg curl machine", target:"3 × 12 reps",           settings:"L-close: 3 / L-far: 2 / Top: 4",tip:"Hamstring isolation. 3-second lowering phase for maximum benefit.",                                         sets:3, type:"strength"},
      {id:"b3", name:"Leg extension machine",   target:"3 × 12 reps",           settings:"Knee pos: 2",                    tip:"Quad isolation. Full extension, brief pause at top, controlled return.",                                     sets:3, type:"strength"},
      {id:"b4", name:"Calf extension machine",  target:"3 × 15 reps",           settings:"Seat: 6",                        tip:"Full range — all the way down for stretch, all the way up.",                                                sets:3, type:"strength"},
      {id:"b5", name:"Bodyweight lunges",       target:"3 × 12 reps/leg",       settings:"",                               tip:"Step forward, back knee just above floor, drive through front heel to stand.",                               sets:3, type:"strength"},
      {id:"b6", name:"Rotary torso machine",    target:"3 × 15 reps/side",      settings:"",                               tip:"Anti-rotation. Move from the core, not the arms. Slow and controlled.",                                      sets:3, type:"core"},
      {id:"b7", name:"Hanging knee tuck",       target:"3 × 12–15 reps",        settings:"Captain's chair or bar",         tip:"Hip flexor / lower abs. Draw knees to chest, no swinging. Sub: lying leg raises.",                          sets:3, type:"core"},
    ]
  },
  c: {
    title: "Day C — full body + core",
    warmup: "Full body: arm circles, hip circles, leg swings, torso rotations, bodyweight squat × 10, shoulder rolls",
    cooldown: "Full body: chest opener, lat side stretch, seated hamstring, hip flexor lunge, quad stretch, calf stretch, wrist flexors",
    cardio: "Treadmill walk or stationary bike",
    cardioNote: "Heart rate ~60–70% max. Keep incline 1–2% max (ankle caution).",
    exercises: [
      {id:"c1", name:"Chest press machine",     target:"3 × 12 reps (moderate)", settings:"Seat: 3",                      tip:"Touch base on push. Day C isn't max effort — form over weight.",                                             sets:3, type:"strength"},
      {id:"c2", name:"Seated row machine",       target:"3 × 12 reps",           settings:"Chest pad: 5 / Seat: 5",        tip:"Push/pull balance with chest press.",                                                                        sets:3, type:"strength"},
      {id:"c3", name:"Leg press machine",        target:"3 × 12 reps (lighter)", settings:"Seat: 4",                      tip:"Full body day lower touch. Moderate weight — Day B is where you push hard on legs.",                         sets:3, type:"strength"},
      {id:"c4", name:"Shoulder press machine",   target:"3 × 12 reps",           settings:"Seat: 4",                       tip:"Shoulders recover faster — good choice for Day C.",                                                          sets:3, type:"strength"},
      {id:"c5", name:"Lat pulldown machine",     target:"3 × 12 reps",           settings:"",                              tip:"Vertical pull to complement horizontal row. Builds lats and improves posture.",                               sets:3, type:"strength"},
      {id:"c6", name:"Plank hold",               target:"3 sets × 50–55 sec",    settings:"",                             tip:"Anti-extension. Push your record when energy allows.",                                                       sets:3, type:"core", isTime:true},
      {id:"c7", name:"Rotary torso machine",     target:"3 × 15 reps/side",      settings:"",                              tip:"Second time this week — oblique strength supports your running.",                                             sets:3, type:"core"},
      {id:"c8", name:"Cable crunch",             target:"3 × 15 reps",           settings:"",                              tip:"Kneel facing cable, rope behind head, crunch down leading with elbows. Keep hips still.",                     sets:3, type:"core"},
    ]
  }
};

export const FEELS = ["Easy","Good","Hard","Tough"];
export const FS = {
  Easy:  {bg:"#E1F5EE", bo:"#5DCAA5", co:"#0F6E56"},
  Good:  {bg:"#E6F1FB", bo:"#85B7EB", co:"#185FA5"},
  Hard:  {bg:"#FAEEDA", bo:"#FAC775", co:"#854F0B"},
  Tough: {bg:"#FCEBEB", bo:"#F09595", co:"#A32D2D"},
};

// Seed history in array-of-sessions format
export const SEED = {
  a1:[{date:"Wk5",sets:[{w:"90",r:"12"},{w:"80",r:"12"},{w:"90",r:"10"}],pr:false}],
  a2:[{date:"Wk5",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}],pr:false}],
  a3:[{date:"Wk5",sets:[{w:"55",r:"10"},{w:"55",r:"10"},{w:"55",r:"10"}],pr:false}],
  a4:[{date:"Wk5",sets:[{w:"35",r:"10"},{w:"35",r:"10"},{w:"35",r:"10"}],pr:false}],
  a5:[{date:"Wk2",sets:[{w:"40",r:"12"},{w:"40",r:"12"}],pr:false}],
  a6:[{date:"Wk4",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}],pr:false}],
  a7:[{date:"Wk5",sets:[{w:"50"},{w:"50"},{w:"50"}],pr:false}],
  a8:[{date:"Wk1",sets:[{w:"40",r:"15"},{w:"40",r:"15"},{w:"40",r:"15"}],pr:false}],
  b1:[{date:"Wk5",sets:[{w:"200",r:"12"},{w:"200",r:"12"},{w:"200",r:"12"},{w:"200",r:"12"}],pr:false}],
  b2:[{date:"Wk5",sets:[{w:"85",r:"12"},{w:"85",r:"12"},{w:"85",r:"12"}],pr:false}],
  b3:[{date:"Wk4",sets:[{w:"85",r:"12"},{w:"85",r:"12"},{w:"85",r:"12"}],pr:false}],
  b4:[{date:"Wk5",sets:[{w:"100",r:"15"},{w:"100",r:"15"},{w:"100",r:"15"}],pr:false}],
  b5:[{date:"Wk5",sets:[{w:"BW",r:"12"},{w:"BW",r:"12"},{w:"BW",r:"12"}],pr:false}],
  c1:[{date:"Wk5",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}],pr:false}],
  c2:[{date:"Wk5",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}],pr:false}],
  c3:[{date:"Wk5",sets:[{w:"180",r:"12"},{w:"180",r:"12"},{w:"180",r:"12"}],pr:false}],
  c4:[{date:"Wk5",sets:[{w:"55",r:"10"},{w:"55",r:"10"},{w:"55",r:"10"}],pr:false}],
  c5:[{date:"Wk4",sets:[{w:"90",r:"12"},{w:"90",r:"12"},{w:"90",r:"12"}],pr:false}],
  c6:[{date:"Wk5",sets:[{w:"50"},{w:"50"},{w:"50"}],pr:false}],
};

export function freshEx() { return {sets:[], feel:"", note:"", done:false}; }

// Returns {text, date, pr} from the last session in a history array, or null
export function prevLabel(hist, isTime) {
  if (!Array.isArray(hist) || !hist.length) return null;
  const last = hist[hist.length - 1];
  if (!last?.sets?.length) return null;
  const parts = last.sets.filter(s=>s?.w).map(s => isTime ? `${s.w}s` : `${s.w}lb${s.r?"×"+s.r:""}`);
  return parts.length ? {text: parts.join(" · "), date: last.date, pr: last.pr} : null;
}

// Max numeric weight across all sessions for an exercise
export function allTimeBest(hist, isTime) {
  if (!Array.isArray(hist) || !hist.length) return null;
  let best = 0, bestDate = null;
  for (const s of hist) {
    const m = Math.max(...(s.sets||[]).map(x=>parseFloat(x.w)||0).filter(Boolean));
    if (m > best) { best = m; bestDate = s.date; }
  }
  return best > 0 ? {w: best, date: bestDate, unit: isTime ? "s" : "lb"} : null;
}
