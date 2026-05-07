/* ─── Types ─────────────────────────────────────────────────────────── */
export type RuleKind       = "hard" | "soft" | "escalation";
export type PermKind       = "admin" | "edit" | "view";
export type KnowledgeType  = "document" | "url" | "crm" | "faq" | "product";
export type IntegrationState = "connected" | "issue" | "available";
export type TraceStepKind  = "ok" | "warn" | "ai" | "policy" | "system";
export type ActivityState  = "auto-sent" | "queued" | "approved" | "edited" | "escalated" | "rejected";

export interface ToneAxis      { id: string; left: string; right: string; value: number; }
export interface DoExample     { kind: "do" | "dont"; scenario: string; response: string; }
export interface TrainingRow   { id: string; scenario: string; response: string; matches: number; last: string; }
export interface PolicyRule    { id: string; kind: RuleKind; title: string; desc: string; trigger: string; active: boolean; }
export interface AutonomyBucket{ level: "auto"|"review"|"escalate"; label: string; pct: string; threshold: string; desc: string; }
export interface KnowledgeSrc  { id: string; type: KnowledgeType; name: string; items: string; used: number; last: string; }
export interface Integration   { id: string; color: string; abbr: string; name: string; desc: string; state: IntegrationState; }
export interface LocationRow   { id: string; name: string; autonomy: string; floor: string; escalate: string; override: boolean; }
export interface TeamMember    { id: string; initials: string; hue: string; name: string; email: string; role: string; perm: PermKind; approvals: number; }
export interface TestFixture   { id: string; rating: number; source: string; who: string; text: string; confidence?: number; traces: string[]; }
export interface TraceStep     { id: string; kind: TraceStepKind; name: string; time: string; detail: string; kv?: Record<string,string>; cite?: string[]; }
export interface ActivityRow   { id: string; when: string; ts: string; name: string; initials: string; hue: string; location: string; source: string; rating: number; draft: string; conf: number; state: ActivityState; }

/* ─── Tone axes ─────────────────────────────────────────────────────── */
export const TONE_AXES: ToneAxis[] = [
  { id: "warmth",   left: "Cool",      right: "Warm",      value: 58 },
  { id: "energy",   left: "Measured",  right: "Energetic", value: 42 },
  { id: "formality",left: "Casual",    right: "Formal",    value: 35 },
  { id: "length",   left: "Concise",   right: "Detailed",  value: 71 },
];

/* ─── Do / Don't examples ───────────────────────────────────────────── */
export const DO_DONTS: DoExample[] = [
  { kind:"do",   scenario:"Customer reports late delivery", response:"We sincerely apologise for the delay and are actively investigating the status of your shipment. We'll update you within 24 hours." },
  { kind:"dont", scenario:"Customer reports late delivery", response:"The delay was caused by the carrier — this is outside our control and we cannot be held responsible for third-party logistics." },
  { kind:"do",   scenario:"Negative review about product quality", response:"Thank you for your honest feedback. We'd love the opportunity to make this right — please reach out to our team directly." },
  { kind:"dont", scenario:"Negative review about product quality", response:"We disagree with this review. Our quality team has verified that all products meet our standards before shipment." },
];

/* ─── Scenario playbook ─────────────────────────────────────────────── */
export const TRAINING_ROWS: TrainingRow[] = [
  { id:"t1", scenario:"Delivery delay complaint",     response:"Apologise, investigate, update within 24h",          matches:142, last:"2 days ago" },
  { id:"t2", scenario:"Wrong item received",          response:"Apologise, arrange return, ship replacement",         matches:89,  last:"4 days ago" },
  { id:"t3", scenario:"Product quality concern",      response:"Thank, escalate to QA, offer exchange",              matches:67,  last:"1 week ago" },
  { id:"t4", scenario:"Billing / charge dispute",     response:"Acknowledge, escalate to billing within 2h",         matches:55,  last:"3 days ago" },
  { id:"t5", scenario:"Positive review (4–5 stars)",  response:"Thank warmly, invite to return, mention loyalty",    matches:423, last:"1 day ago" },
];

/* ─── Policy rules ──────────────────────────────────────────────────── */
export const POLICY_RULES: PolicyRule[] = [
  { id:"r1", kind:"hard",      title:"Never promise refunds",        desc:"Do not commit to a refund without billing team approval.", trigger:"draft contains 'refund' OR 'money back'",         active:true  },
  { id:"r2", kind:"hard",      title:"Never name competitors",       desc:"Avoid any mention of competing products or services.",      trigger:"draft contains competitor keywords",              active:true  },
  { id:"r3", kind:"hard",      title:"Never share internal data",    desc:"Do not quote internal order IDs or pricing formulas.",     trigger:"draft contains '[internal]'",                    active:true  },
  { id:"r4", kind:"soft",      title:"Prefer first-name greetings",  desc:"Address reviewers by first name when available.",          trigger:"customer name available",                         active:true  },
  { id:"r5", kind:"soft",      title:"Keep replies under 120 words", desc:"Concise replies outperform lengthy ones in A/B tests.",    trigger:"draft word count > 120",                          active:false },
  { id:"r6", kind:"soft",      title:"Include CTA for 3-star reviews",desc:"Offer a direct contact link on neutral reviews.",         trigger:"rating = 3",                                      active:true  },
  { id:"r7", kind:"escalation","title":"Escalate legal language",    desc:"Route to manager if legal threats are detected.",          trigger:"review contains 'lawyer' OR 'sue' OR 'lawsuit'",  active:true  },
  { id:"r8", kind:"escalation","title":"Escalate safety concerns",   desc:"Route to safety team for any injury or hazard mentions.",  trigger:"review contains 'injury' OR 'dangerous' OR 'hurt'",active:true },
];

/* ─── Autonomy buckets ──────────────────────────────────────────────── */
export const AUTONOMY_BUCKETS: AutonomyBucket[] = [
  { level:"auto",     label:"Auto-send",   pct:"73%", threshold:"conf ≥ 0.85", desc:"Reply is sent immediately with no human review." },
  { level:"review",   label:"Queue",       pct:"22%", threshold:"0.80 – 0.84", desc:"Drafted reply held in inbox for quick approval." },
  { level:"escalate", label:"Escalate",    pct:"5%",  threshold:"conf < 0.80", desc:"Routed to a human agent for full intervention." },
];

/* ─── Knowledge sources ─────────────────────────────────────────────── */
export const KNOWLEDGE_SOURCES: KnowledgeSrc[] = [
  { id:"k1", type:"document", name:"Return & Refund Policy v4",      items:"1 doc · 8 pages",    used:892,  last:"3 days ago" },
  { id:"k2", type:"faq",      name:"Customer FAQ (230 Q&A pairs)",   items:"230 chunks",          used:1240, last:"1 day ago"  },
  { id:"k3", type:"product",  name:"Product Catalogue 2025",         items:"480 SKUs",            used:567,  last:"5 days ago" },
  { id:"k4", type:"url",      name:"Help Centre — birdeye.com/help", items:"Live crawl · 142 pg", used:334,  last:"6 hrs ago"  },
  { id:"k5", type:"crm",      name:"Salesforce — Open Cases",        items:"Live sync · 1.2K",   used:88,   last:"12 hrs ago" },
  { id:"k6", type:"document", name:"Brand Voice Guidelines",         items:"1 doc · 22 pages",   used:1580, last:"2 weeks ago"},
];

/* ─── Integrations ──────────────────────────────────────────────────── */
export const INTEGRATIONS: Integration[] = [
  { id:"google",     color:"#3186e9", abbr:"G",  name:"Google Business", desc:"Reviews & Q&A sync",          state:"connected"  },
  { id:"facebook",   color:"#1877f2", abbr:"f",  name:"Facebook Pages",  desc:"Recommendations & DMs",       state:"connected"  },
  { id:"yelp",       color:"#d32323", abbr:"Y",  name:"Yelp",            desc:"Review monitoring",            state:"issue"      },
  { id:"slack",      color:"#611f69", abbr:"S",  name:"Slack",           desc:"Review queue notifications",   state:"connected"  },
  { id:"salesforce", color:"#00a1e0", abbr:"SF", name:"Salesforce CRM",  desc:"Customer data enrichment",    state:"connected"  },
  { id:"zendesk",    color:"#03363d", abbr:"Zd", name:"Zendesk",         desc:"Ticket auto-creation",         state:"available"  },
  { id:"hubspot",    color:"#ff7a59", abbr:"Hs", name:"HubSpot",         desc:"Contact sync + pipeline",      state:"available"  },
  { id:"tripadvisor",color:"#34e0a1", abbr:"TA", name:"Tripadvisor",     desc:"Hospitality review channel",   state:"available"  },
];

/* ─── Location overrides ────────────────────────────────────────────── */
export const LOCATION_ROWS: LocationRow[] = [
  { id:"l1", name:"Downtown SF — Market St",    autonomy:"Full auto",        floor:"0.85", escalate:"Legal mentions",     override:false },
  { id:"l2", name:"Miami Beach — Ocean Drive",  autonomy:"Hybrid",           floor:"0.80", escalate:"Legal + 1-star",     override:true  },
  { id:"l3", name:"Chicago — Magnificent Mile", autonomy:"Human in loop",    floor:"0.95", escalate:"All negative",       override:true  },
  { id:"l4", name:"Austin — 6th Street",        autonomy:"Full auto",        floor:"0.85", escalate:"Legal mentions",     override:false },
];

/* ─── Team ──────────────────────────────────────────────────────────── */
export const TEAM_MEMBERS: TeamMember[] = [
  { id:"u1", initials:"BK", hue:"#2552ED", name:"Balaji K.",       email:"balaji.k@birdeye.com",    role:"Owner",      perm:"admin", approvals:0   },
  { id:"u2", initials:"SM", hue:"#7c3aed", name:"Sarah Martinez",  email:"s.martinez@birdeye.com",  role:"Head of CX", perm:"admin", approvals:48  },
  { id:"u3", initials:"DR", hue:"#0891b2", name:"David Rodriguez", email:"d.rodriguez@birdeye.com", role:"CX Manager", perm:"edit",  approvals:124 },
  { id:"u4", initials:"PL", hue:"#059669", name:"Priya Lal",       email:"p.lal@birdeye.com",       role:"Reviewer",   perm:"edit",  approvals:89  },
  { id:"u5", initials:"TN", hue:"#d97706", name:"Tom Nguyen",      email:"t.nguyen@birdeye.com",    role:"Analyst",    perm:"view",  approvals:0   },
];

/* ─── Test fixtures ─────────────────────────────────────────────────── */
export const TEST_FIXTURES: TestFixture[] = [
  {
    id:"f1", rating:5, source:"Google", who:"Happy customer",
    text:"Absolutely love this place! Staff is incredibly friendly and the service was top-notch. Will definitely be coming back again soon.",
    confidence:0.96,
    traces:["Trigger: rating=5","Policy: no hard rule","Knowledge: 3 chunks","Tone: warm+concise","Draft: 89 words","Gate: auto-send"],
  },
  {
    id:"f2", rating:2, source:"Yelp", who:"Dissatisfied customer",
    text:"Very disappointed with my experience. Waited 40 minutes for a simple order. The staff seemed disorganised. I won't be returning.",
    confidence:0.72,
    traces:["Trigger: rating≤2","Policy: escalation check","Knowledge: 4 chunks","Tone: measured+formal","Draft: 104 words","Gate: queue (0.72 < 0.80)"],
  },
  {
    id:"f3", rating:3, source:"Facebook", who:"Neutral reviewer",
    text:"Average experience overall. Food was decent but nothing remarkable. Service was okay. Parking was difficult.",
    confidence:0.81,
    traces:["Trigger: rating=3","Policy: CTA rule matched","Knowledge: 2 chunks","Tone: warm","Draft: 76 words","Gate: queue (0.81 in review band)"],
  },
  {
    id:"f4", rating:1, source:"Google", who:"Legal threat",
    text:"This is unacceptable. My lawyer will be hearing about this. Worst experience of my life. I will make sure everyone knows.",
    confidence:0.0,
    traces:["Trigger: rating=1","Policy: HARD STOP — legal keyword","Escalation: routed to manager","Draft: none","Gate: escalated"],
  },
];

/* ─── Execution trace steps ─────────────────────────────────────────── */
export const TRACE_STEPS: TraceStep[] = [
  { id:"s1", kind:"system", name:"Trigger matched",       time:"00:00.008", detail:"Review ingested from Google Business API. Rating=4, language=en.",            kv:{ source:"Google", rating:"4", lang:"en" } },
  { id:"s2", kind:"policy", name:"Hard rule check",       time:"00:00.024", detail:"Checked 3 hard rules. All clear. No legal keywords detected.",               kv:{ rules_checked:"3", violations:"0" } },
  { id:"s3", kind:"ai",     name:"Knowledge retrieval",   time:"00:00.087", detail:"Fetched 3 context chunks from FAQ, Return Policy, and Brand Voice Guide.",    cite:["FAQ §4.2 — delivery windows","Return Policy §7 — exchange process","Brand Voice — tone guidelines"] },
  { id:"s4", kind:"ok",     name:"Soft rule evaluation",  time:"00:00.091", detail:"CTA rule matched (rating ≤ 4). First-name greeting applied. Word count: 94.", kv:{ word_count:"94", cta:"included", greeting:"first-name" } },
  { id:"s5", kind:"ai",     name:"Draft generated",       time:"00:00.310", detail:"LLM draft produced. Confidence 0.91. Tone axes: warm=0.72, formal=0.35.",     kv:{ model:"birdeye-cx-v2", confidence:"0.91", tokens:"127" } },
  { id:"s6", kind:"policy", name:"Autonomy gate",         time:"00:00.315", detail:"Confidence 0.91 ≥ floor 0.85. Policy: Full auto. Action: queued for send.",   kv:{ floor:"0.85", action:"auto-send" } },
  { id:"s7", kind:"ok",     name:"Reply dispatched",      time:"00:00.401", detail:"Response posted to Google Business via API. Status 200 OK.",                   kv:{ status:"200", delivery:"confirmed" } },
];

/* ─── Activity table rows ────────────────────────────────────────────── */
export const ACTIVITY_ROWS: ActivityRow[] = [
  { id:"A4829", when:"Just now", ts:"Apr 20 · 4:38 PM", name:"Maria Torres",   initials:"MT", hue:"#7c3aed", location:"Miami, FL",         source:"Google",   rating:4, draft:"Thank you for taking the time to share your feedback, Maria. We're delighted to hear…",     conf:0.91, state:"queued"    },
  { id:"A4828", when:"3m ago",   ts:"Apr 20 · 4:35 PM", name:"James Chen",     initials:"JC", hue:"#0891b2", location:"Seattle, WA",        source:"Yelp",     rating:3, draft:"We sincerely appreciate your honest feedback, James. We'd love the opportunity to…",        conf:0.78, state:"escalated" },
  { id:"A4827", when:"8m ago",   ts:"Apr 20 · 4:30 PM", name:"Sarah Williams", initials:"SW", hue:"#059669", location:"Chicago, IL",        source:"Google",   rating:5, draft:"What a wonderful review — thank you so much, Sarah! We look forward to welcoming you…",    conf:0.97, state:"auto-sent" },
  { id:"A4826", when:"14m ago",  ts:"Apr 20 · 4:24 PM", name:"Alex K.",        initials:"AK", hue:"#2552ED", location:"Los Angeles, CA",    source:"Facebook", rating:4, draft:"Thank you for the kind words, Alex! Our team works hard every day to deliver…",             conf:0.89, state:"approved"  },
  { id:"A4825", when:"22m ago",  ts:"Apr 20 · 4:16 PM", name:"Priya Sharma",   initials:"PS", hue:"#d97706", location:"Austin, TX",         source:"Google",   rating:2, draft:"We're truly sorry to hear about your experience, Priya. This falls well below the…",       conf:0.71, state:"edited"    },
  { id:"A4824", when:"31m ago",  ts:"Apr 20 · 4:07 PM", name:"Robert Kim",     initials:"RK", hue:"#dc2626", location:"San Francisco, CA",  source:"Yelp",     rating:1, draft:"",                                                                                            conf:0.00, state:"escalated" },
  { id:"A4823", when:"45m ago",  ts:"Apr 20 · 3:53 PM", name:"Linda Park",     initials:"LP", hue:"#0891b2", location:"Denver, CO",         source:"Google",   rating:5, draft:"Linda, reviews like yours truly make our day! We're so glad you enjoyed every…",            conf:0.94, state:"auto-sent" },
  { id:"A4822", when:"1h ago",   ts:"Apr 20 · 3:38 PM", name:"David Mills",    initials:"DM", hue:"#7c3aed", location:"Portland, OR",       source:"Google",   rating:4, draft:"Thank you for the thoughtful review, David. Your feedback on wait times has been…",         conf:0.83, state:"queued"    },
  { id:"A4821", when:"1h ago",   ts:"Apr 20 · 3:22 PM", name:"Amy Chen",       initials:"AC", hue:"#059669", location:"Seattle, WA",        source:"Facebook", rating:3, draft:"Thank you for visiting us, Amy. We appreciate you letting us know about your experience…",   conf:0.82, state:"approved"  },
  { id:"A4820", when:"2h ago",   ts:"Apr 20 · 2:58 PM", name:"Mark Johnson",   initials:"MJ", hue:"#d97706", location:"Phoenix, AZ",        source:"Google",   rating:5, draft:"Mark, what an incredible review — we're thrilled you had such a great time and…",           conf:0.96, state:"auto-sent" },
];
