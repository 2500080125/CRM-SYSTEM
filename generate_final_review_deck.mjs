import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root = process.cwd();
const out = path.join(root, 'output', 'final-review', 'PEL_CRM_Project_Presentation_S_Eswar_Charan.pptx');
await fs.mkdir(path.dirname(out), { recursive: true });
const P = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const c = { navy:'#102A43', ink:'#1D3557', white:'#FFFFFF', pale:'#EEF4FB', blue:'#2F5FE3', teal:'#0E8C8C', gold:'#D6A64A', muted:'#627D98', border:'#D9E3F0', coral:'#C85A54' };
const serif='Aptos Display', sans='Aptos';
function shape(s, geometry, x,y,w,h,fill='none',radius=0){return s.shapes.add({geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:fill==='none'?'none':fill,width:0},radius});}
function text(s, value, x,y,w,h,size=20,color=c.ink,bold=false,align='left',font=sans){const box=shape(s,'textbox',x,y,w,h); box.text=value; box.text.style={typeface:font,fontSize:size,color,bold,align,autoFit:'shrink'}; return box;}
function line(s,x,y,w,h,fill){shape(s,'rect',x,y,w,h,fill);}
function slide(title, section, index){const s=P.slides.add();s.background.fill=c.white;line(s,0,0,1280,12,c.navy);text(s,section.toUpperCase(),72,42,650,18,11,c.blue,true);text(s,title,72,76,1040,60,34,c.navy,true,'left',serif);text(s,String(index).padStart(2,'0'),1130,44,78,20,12,c.gold,true,'right');line(s,72,148,1136,1,c.border);text(s,'PEL CRM  |  PROJECT TEAM  |  SECTION 18',72,680,900,15,9,c.muted,true);return s;}
function bulletList(s,items,x,y,w,size=18,gap=48){items.forEach((item,index)=>{shape(s,'ellipse',x,y+index*gap+8,9,9,index%2?c.teal:c.gold);text(s,item,x+20,y+index*gap,w-20,34,size,c.ink,false);});}
function infoBand(s,label,body){shape(s,'roundRect',72,590,1136,58,c.pale,14);text(s,label,98,608,110,16,11,c.blue,true);text(s,body,220,604,945,25,15,c.ink,false);}

// 1 Cover
let s=P.slides.add();s.background.fill=c.navy;shape(s,'rect',0,0,1280,720,c.navy);shape(s,'rect',900,0,380,720,'#163B66');shape(s,'rect',1040,0,240,720,'#245E9F');
text(s,'PEL CRM',86,90,470,24,15,'#A9C7E8',true);text(s,'Customer Relationship\nManagement System',86,152,690,155,55,c.white,true,'left',serif);line(s,88,333,150,5,c.gold);text(s,'Professional frontend project review',88,365,630,32,25,'#DCEAF2',false);text(s,'Project team',88,480,300,22,14,c.gold,true);text(s,'S. Eswar Charan  |  2500080125\nS. Lakshmi Charan  |  2500080176\nPonesh  |  2500080223',88,510,570,70,16,c.white,false);text(s,'Section 18',88,600,260,22,14,'#B7D2EA',false);text(s,'React + Vite\nBrowser-first CRM workspace',955,255,236,100,24,c.white,true,'left',serif);text(s,'01',1050,98,130,56,50,c.gold,true,'right');

// 2 technology
s=slide('Technology used in this project','Technology',2);text(s,'The application uses browser technologies for structure, visual design, and interactive behaviour.',72,182,930,35,22,c.navy,true);
[['HTML','Structure','Login forms, navigation, tables, modals, page content, and accessible controls.'],['CSS','Visual system','Monsoon design, responsive layouts, dark mode, calendar, transitions, and component states.'],['JavaScript','Behaviour','Validation, records, filters, drag and drop, CSV, analytics, and notifications.']].forEach((item,i)=>{const x=72+i*378;shape(s,'roundRect',x,270,350,255,i===1?c.pale:'#FAFCFF',18);text(s,item[0].toUpperCase(),x+28,302,270,17,11,c.blue,true);text(s,item[1],x+28,337,280,30,24,c.navy,true,'left',serif);line(s,x+28,385,74,4,i===0?c.blue:i===1?c.gold:c.teal);text(s,item[2],x+28,415,286,75,15,c.ink,false);});infoBand(s,'React + Vite','React organizes reusable components and Vite builds the production-ready frontend.');

// 3 architecture
s=slide('Separate user and administrator portals','Architecture',3);text(s,'The same browser data source powers two clearly different experiences.',72,182,800,33,22,c.navy,true);
shape(s,'roundRect',72,255,522,258,c.pale,18);text(s,'USER PORTAL',106,288,230,18,12,c.blue,true);text(s,'Personal CRM workspace',106,325,340,36,27,c.navy,true,'left',serif);bulletList(s,['Sign up and personal sign in','Own customers, pipeline, tasks','Profile, settings, saved views'],108,388,390,15,35);
shape(s,'roundRect',636,255,572,258,'#F7FAFC',18);text(s,'ADMINISTRATOR PORTAL',670,288,260,18,12,c.teal,true);text(s,'Workspace management',670,325,360,36,27,c.navy,true,'left',serif);bulletList(s,['Restricted /admin sign in','Cross-user customer, pipeline, task view','Users, metrics, workspace settings'],672,388,440,15,35);infoBand(s,'Browser data rule','User pages filter records by ownerId. The admin can select a user to manage assigned records.');

// 4 flow
s=slide('CRM workflow from sign in to review','Workflow',4);text(s,'Every record entered in the browser feeds the next relevant page and dashboard output.',72,182,940,35,22,c.navy,true);
const steps=[['01','Sign in','Open portal'],['02','Customer','Save record'],['03','Opportunity','Set stage'],['04','Task','Create follow-up'],['05','Dashboard','Review work']];line(s,145,364,980,3,c.border);steps.forEach((item,i)=>{const x=72+i*225;shape(s,'ellipse',x+55,326,78,78,i===4?c.gold:c.navy);text(s,item[0],x+55,353,78,20,15,c.white,true,'center');text(s,item[1],x,430,188,25,18,c.navy,true,'center');text(s,item[2],x,463,188,18,13,c.muted,false,'center');});infoBand(s,'Live feedback','Toasts, activity entries, metrics, task counts, analytics, and pipeline totals respond to record changes.');

// 5 features
s=slide('Core frontend features','Implemented features',5);text(s,'The review version focuses on working interactions rather than only static screens.',72,182,900,35,22,c.navy,true);
const features=[['Search and saved views','Search customer, opportunity, and task records. Save filters in browser storage.'],['Pipeline movement','Drag an opportunity across the six sales stages.'],['Task calendar','Manage due dates, notes, priority, completion state, and task count.'],['CSV tools','Export visible records or import customer, task, and opportunity CSV data.'],['Analytics','Show pipeline value, completed tasks, high-priority work, and a conversion snapshot.'],['UI quality','Loading skeletons, page transitions, toast messages, keyboard shortcuts, and responsive controls.']];features.forEach((item,i)=>{const col=i%2,row=Math.floor(i/2),x=72+col*567,y=255+row*110;shape(s,'roundRect',x,y,538,86,row===1?c.pale:'#FAFCFF',13);text(s,item[0],x+22,y+17,465,19,15,c.navy,true);text(s,item[1],x+22,y+43,485,28,13,c.muted,false);});

// 6 persistence
s=slide('Browser storage and session design','Data handling',6);text(s,'The project has no backend or database. It persists the review data inside the browser.',72,182,980,34,22,c.navy,true);
shape(s,'roundRect',72,264,535,225,c.pale,18);text(s,'LOCAL STORAGE',106,300,210,18,12,c.blue,true);text(s,'Persistent browser data',106,337,350,34,26,c.navy,true,'left',serif);bulletList(s,['User accounts and CRM records','Settings, activity, saved views','Available after closing and reopening'],106,396,420,14,31);
shape(s,'roundRect',674,264,534,225,'#F7FAFC',18);text(s,'SESSION STORAGE',708,300,220,18,12,c.teal,true);text(s,'Current login session',708,337,350,34,26,c.navy,true,'left',serif);bulletList(s,['Stores current portal session','Routes to login after logout','Separates admin and user access'],708,396,420,14,31);infoBand(s,'Review limitation','Browser storage is appropriate for this frontend prototype. A production CRM needs secure server-side authentication and database storage.');

// 7 components
s=slide('Components, theme, and main functions','Implementation reference',7);text(s,'The project is split into focused React components so portal screens and interactive tools stay reusable.',72,182,1040,38,20,c.navy,true);
shape(s,'roundRect',72,252,535,270,c.pale,18);text(s,'CORE PORTAL COMPONENTS',106,286,310,18,12,c.blue,true);text(s,'Auth, Dashboard, AdminDashboard,\nCustomers, Pipeline, Tasks,\nMy Profile, Settings, Users',106,326,432,93,20,c.navy,true);text(s,'These render the main user and administrator screens.',106,442,418,35,14,c.muted,false);
shape(s,'roundRect',674,252,534,270,'#F7FAFC',18);text(s,'SUPPORTING COMPONENTS',708,286,310,18,12,c.teal,true);text(s,'RecordTools, SavedViews, TaskCalendar,\nAnalyticsPanel, ActivityTimeline,\nToolbarPanel, ConfirmDelete, Toast, PageSkeleton',708,326,440,95,16,c.navy,true);text(s,'They add search, views, feedback, activity, and loading states.',708,442,430,35,14,c.muted,false);
infoBand(s,'Fixed Monsoon theme','CSS maintains a consistent Monsoon design; the light/dark display toggle is available, but users cannot select a separate theme pack. Core functions include authenticate, saveRecord, moveDeal, completeTask, importRecords, and downloadCsv.');

// 8 credentials
s=slide('Credentials and live review preparation','Demo setup',8);text(s,'Use the confirmed administrator account. Create or use a registered user account in the same browser for the User portal demo.',72,182,1020,38,21,c.navy,true);
shape(s,'roundRect',72,260,545,250,c.pale,18);text(s,'ADMINISTRATOR ACCESS',108,296,280,18,12,c.blue,true);text(s,'/admin',108,333,250,33,28,c.navy,true,'left',serif);text(s,'Email: admin@pel.local\nPassword: PELAdmin@2026',108,390,390,70,18,c.ink,true);
shape(s,'roundRect',663,260,545,250,'#F7FAFC',18);text(s,'USER ACCOUNT RULE',699,296,260,18,12,c.teal,true);text(s,'Sign up in the user portal',699,333,380,33,25,c.navy,true,'left',serif);text(s,'User passwords are stored only in that browser Local Storage.\nUse an existing account or create one before the demo.',699,390,420,66,16,c.ink,false);infoBand(s,'Do not invent passwords','The source code confirms the admin credential only. It does not contain a recoverable list of user passwords.');

// 8 close
s=P.slides.add();s.background.fill=c.navy;shape(s,'rect',0,0,1280,720,c.navy);line(s,86,114,150,5,c.gold);text(s,'PEL CRM',86,70,450,21,13,'#A9C7E8',true);text(s,'Ready for a\nlive frontend review',86,154,680,142,54,c.white,true,'left',serif);text(s,'Demo: user record flow, administrator oversight, browser storage, and production build.',90,330,750,65,22,'#DCEAF2',false);text(s,'Thank you',90,510,440,47,31,c.gold,true,'left',serif);text(s,'S. Eswar Charan  |  2500080125\nS. Lakshmi Charan  |  2500080176\nPonesh  |  2500080223  |  Section 18',90,560,620,62,15,'#B7D2EA',false);

await (await PresentationFile.exportPptx(P)).save(out);
console.log(JSON.stringify({out, slides:P.slides.length}));
