import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const root = process.cwd();
const buildDir = path.join(root, ".build-crm");
const outDir = path.join(root, "output");
const pptxDir = path.join(outDir, "pptx");
const pdfDir = path.join(outDir, "pdf");
await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(pptxDir, { recursive: true });
await fs.mkdir(pdfDir, { recursive: true });

const SKILL_DIR = "C:/Users/ASUS/.codex/plugins/cache/openai-primary-runtime/presentations/26.915.20218/skills/presentations";
const family = "Georgia";
const P = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const navy = "#102A43", blue = "#2563EB", teal = "#0F766E", ink = "#243B53", muted = "#52606D", pale = "#F4F7FB", orange = "#D97706", red = "#B91C1C";

function box(slide, text, x, y, w, h, size=24, color=ink, bold=false, align="left") {
  const s = slide.shapes.add({ geometry: "textbox", position: { left:x, top:y, width:w, height:h }, fill:"none", line:{fill:"none",width:0} });
  s.text = text; s.text.style = { typeface: family, fontSize:size, bold, color, autoFit:"shrink", align };
  return s;
}
function base(title, kicker="CRM SYSTEM") {
  const s=P.slides.add(); s.background.fill="#FFFFFF";
  s.shapes.add({geometry:"rect", position:{left:0,top:0,width:1280,height:14}, fill:blue, line:{fill:blue,width:0}});
  box(s,kicker,72,38,1100,24,13,blue,true); box(s,title,72,70,1120,58,36,navy,true);
  return s;
}
function bullets(slide, items, x, y, w, size=22, gap=46, color=ink) {
  items.forEach((t,i)=>{ box(slide,"•  "+t,x,y+i*gap,w,gap, size,color,false); });
}

let s=P.slides.add(); s.background.fill=navy;
box(s,"CRM SYSTEM",80,92,1000,30,18,"#93C5FD",true);
box(s,"Frontend project plan",80,150,980,95,54,"#FFFFFF",true);
box(s,"What to build, what to avoid, and how to finish tonight",84,270,900,55,26,"#D9EAF7");
box(s,"Customer Relationship Management dashboard",84,580,800,30,18,"#93C5FD");

s=base("The project in one sentence");
box(s,"A responsive CRM dashboard that helps a sales team see customers, track interactions, move deals through a pipeline, and manage follow-ups.",90,180,1050,110,34,navy,true);
box(s,"The frontend should feel connected: actions in one area should update the visible story in another area.",90,350,980,75,25,muted);
box(s,"Tonight’s target",90,500,260,28,18,blue,true); box(s,"A polished, demonstrable MVP using realistic sample data and LocalStorage.",90,540,980,48,27,teal,true);

s=base("Minimum viable product");
bullets(s,["Dashboard with KPIs, charts, recent activity, and upcoming follow-ups","Customer list with search, filters, add, edit, delete, and profile view","Sales pipeline with stages from New Lead to Won or Lost","Tasks and reminders with due dates, priorities, and completion states","Responsive navigation, validation, toast feedback, and LocalStorage persistence"],90,165,1080,22,65);
box(s,"Build these features before email campaigns or advanced automation.",90,585,1030,36,22,orange,true);

s=base("Recommended screens");
const screens=["Login","Dashboard","Customers","Customer profile","Sales pipeline","Tasks and reminders","Analytics","Settings"];
screens.forEach((t,i)=>{ const x=90+(i%4)*275, y=175+Math.floor(i/4)*170; s.shapes.add({geometry:"roundRect",position:{left:x,top:y,width:230,height:105},fill:i===1?"#DBEAFE":"#F4F7FB",line:{fill:i===1?blue:"#D9E2EC",width:2},radius:12}); box(s,String(i+1).padStart(2,"0"),x+18,y+16,50,24,15,blue,true); box(s,t,x+18,y+48,195,40,21,navy,true); });

s=base("Core data and interactions");
box(s,"Customer",90,170,250,28,20,blue,true); bullets(s,["Name, email, company, status","Assigned salesperson","Last and next follow-up","Deal value"],90,220,350,20,42);
box(s,"Deal",480,170,250,28,20,teal,true); bullets(s,["Customer and deal name","Value and probability","Pipeline stage","Expected close date"],480,220,350,20,42);
box(s,"Task",870,170,250,28,20,orange,true); bullets(s,["Task title and customer","Due date and priority","Status and notes","Completion action"],870,220,350,20,42);
box(s,"Connected behavior",90,510,1050,42,27,navy,true); box(s,"Add a customer → show it in Customers and Dashboard. Move a deal → update its stage and pipeline totals. Complete a task → remove it from pending follow-ups.",90,560,1080,55,22,muted);

s=base("What to do");
bullets(s,["Start with a wireframe and a small design system: colors, type scale, spacing, and status colors","Create reusable components instead of repeating table rows, cards, modals, and buttons","Use one central state source for customers, deals, tasks, and activities","Use realistic sample data with enough records to make charts and filters meaningful","Validate forms and show clear feedback for success, errors, empty states, and overdue work","Test the full user journey from login to customer creation to pipeline movement to task completion"],90,150,1080,20,55);

s=base("What not to do");
bullets(s,["Do not build a backend, real email sender, or complex authentication for a frontend-only submission","Do not create pages whose buttons do nothing","Do not overcrowd the dashboard with every metric at once","Do not use fake numbers without labels, units, or a clear meaning","Do not copy a generic admin template without connecting the workflows","Do not add advanced features until the MVP works on desktop and mobile","Do not leave broken routes, console errors, placeholder text, or unfinished forms"],90,150,1080,20,55,red);

s=base("Build order for tonight");
const phases=["1. Setup\nReact + Vite\nRouting + theme","2. Shell\nSidebar\nTopbar\nResponsive layout","3. Data\nSample records\nCentral state\nLocalStorage","4. Core\nCustomers\nProfile\nPipeline","5. Finish\nTasks\nCharts\nValidation\nTesting"];
phases.forEach((t,i)=>{const x=70+i*242; s.shapes.add({geometry:"roundRect",position:{left:x,top:210,width:205,height:210},fill:i===4?"#DBEAFE":"#F4F7FB",line:{fill:i===4?blue:"#D9E2EC",width:2},radius:14}); box(s,t,x+18,235,170,150,20,navy,true); if(i<4) box(s,"→",x+212,295,28,30,24,blue,true,"center");});
box(s,"Recommended order: make the core flow work first, then improve the visual polish.",90,540,1000,35,24,teal,true);

s=base("Time estimate");
const rows=[["Project setup and layout","45 min"],["Dashboard","60 min"],["Customers and profile","90 min"],["Pipeline","75 min"],["Tasks and reminders","45 min"],["Analytics and polish","60 min"],["Testing and documentation","45 min"]];
rows.forEach((r,i)=>{const y=160+i*54; box(s,r[0],110,y,650,34,20,ink,i===0); box(s,r[1],850,y,180,34,20,blue,true,"right"); s.shapes.add({geometry:"line",position:{left:110,top:y+40,width:920,height:1},line:{fill:"#D9E2EC",width:1}});});
box(s,"Total focused build time: approximately 7–8 hours for the MVP.",110,575,950,38,25,orange,true);

s=base("Submission checklist");
bullets(s,["All main routes open without errors","Desktop and mobile layouts checked","Customer, deal, and task actions visibly work","Search and filters return correct records","Charts use labelled, understandable data","Forms reject missing or invalid values","No console errors or dead buttons","Screenshots captured for the report","README explains how to run the project"],90,150,1080,19,48);

s=base("Final recommendation");
box(s,"Submit a focused CRM MVP that proves the complete workflow.",90,180,1040,60,34,navy,true);
box(s,"The strongest demo story is simple:",90,300,700,32,22,blue,true);
bullets(s,["Create a customer","Create a deal for that customer","Move the deal through the pipeline","Schedule a follow-up","Complete the follow-up","Show the updated dashboard"],110,350,850,22,46);
box(s,"Optional features belong after this flow works.",90,640,900,32,22,teal,true);

const candidate=path.join(buildDir,"crm-project-plan-candidate.pptx");
await (await PresentationFile.exportPptx(P)).save(candidate);
console.log(JSON.stringify({candidate, slides:P.slides.length, font:family}));
