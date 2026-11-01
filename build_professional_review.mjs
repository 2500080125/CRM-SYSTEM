import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root = process.cwd();
const out = path.join(root, 'output', 'pptx', 'PEL_CRM_Project_Review_Professional_8_Slides_Technology_Updated.pptx');
await fs.mkdir(path.dirname(out), { recursive: true });

const P = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const c = { navy:'#102A43', ink:'#1D3557', cream:'#FBF8F1', white:'#FFFFFF', gold:'#C7A35A', blue:'#3976A8', pale:'#EAF1F5', mist:'#F4F7F8', muted:'#627D98', jade:'#2D7A71', coral:'#C86358' };
const serif = 'Georgia', sans = 'Aptos';
function box(s,x,y,w,h,fill,r=0){ return s.shapes.add({geometry:r?'roundRect':'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill,width:0},radius:r}); }
function txt(s,v,x,y,w,h,size=20,color=c.ink,bold=false,align='left',font=serif){ const q=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});q.text=v;q.text.style={typeface:font,fontSize:size,color,bold,align,autoFit:'shrink'};return q; }
function line(s,x,y,w,h,fill){ box(s,x,y,w,h,fill); }
function header(kicker,title,number){ const s=P.slides.add(); s.background.fill=c.cream; line(s,0,0,1280,13,c.navy); txt(s,kicker.toUpperCase(),72,42,670,22,12,c.blue,true,'left',sans); txt(s,title,72,78,900,58,34,c.navy,true); txt(s,number,1130,46,80,24,13,c.gold,true,'right',sans); line(s,72,144,1136,1,'#D8E1E8'); return s; }
function footer(s,label){ txt(s,label,72,678,500,16,10,c.muted,false,'left',sans); txt(s,'PEL CRM  •  FRONTEND PROJECT REVIEW',760,678,448,16,10,c.muted,true,'right',sans); }
function pill(s,label,x,y,w,fill=c.pale,color=c.blue){ box(s,x,y,w,28,fill,14);txt(s,label,x,y+6,w,15,10,color,true,'center',sans); }
function bullets(s,items,x,y,w){ items.forEach((item,i)=>{ box(s,x,y+i*55,8,8,c.gold,4);txt(s,item,x+20,y-5+i*55,w-20,42,16,c.ink,false,'left',sans); }); }

// 1 — Cover
let s=P.slides.add(); s.background.fill=c.navy;
box(s,0,0,1280,720,c.navy); box(s,890,0,390,720,'#173B61'); box(s,1020,0,260,720,'#21547B');
txt(s,'CRM SYSTEM',88,94,430,24,14,'#A9C6DE',true,'left',sans); txt(s,'PEL',88,148,560,76,57,c.white,true); txt(s,'Customer relationship management',92,238,690,38,25,'#DCEAF2',false,'left',sans); line(s,92,312,142,5,c.gold); txt(s,'Professional frontend project review',92,354,660,36,27,c.white,false,'left',sans); txt(s,'HTML  •  CSS  •  JavaScript',92,470,580,30,17,'#B7D3E8',true,'left',sans); txt(s,'Customer records  /  Sales pipeline  /  Follow-ups  /  Analytics',92,518,740,30,16,'#DCEAF2',false,'left',sans); 
txt(s,'01',1038,100,146,70,54,c.gold,true,'right'); txt(s,'A local-first CRM experience\nfor clear daily decisions.',944,240,238,110,21,c.white,true,'left'); pill(s,'REVIEW EDITION',944,518,194,'#2D658E',c.white);

// 2 — technology
s=header('01  /  Technology','HTML, CSS, and JavaScript in PEL CRM','02');
txt(s,'These three frontend technologies build the complete local CRM experience.',72,182,850,37,25,c.navy,true);
const technology=[
  ['HTML','Structure','Creates the login screen, navigation, customer and task forms, tables, buttons, and accessible page content.'],
  ['CSS','Visual design','Creates the Monsoon interface, responsive layout, white content surfaces, priority colours, charts, and dark mode.'],
  ['JavaScript','Working behaviour','Handles login sessions, form validation, local record saving, search, edit and delete actions, notifications, and live reporting.']
];
technology.forEach((v,i)=>{const x=72+i*380;box(s,x,268,348,268,i===1?c.pale:c.white,18);txt(s,v[0].toUpperCase(),x+28,298,250,18,11,c.blue,true,'left',sans);txt(s,v[1],x+28,330,285,34,25,c.navy,true);line(s,x+28,382,84,4,i===0?c.blue:i===1?c.gold:c.jade);txt(s,v[2],x+28,413,288,86,16,c.ink,false,'left',sans);});
box(s,72,590,1136,46,'#EEF5F6',10); txt(s,'Project scope',98,604,116,18,12,c.jade,true,'left',sans); txt(s,'The CRM runs fully in the browser. It uses no backend, database, cloud service, or deployment.',218,602,905,21,15,c.ink,false,'left',sans); footer(s,'01  FRONTEND TECHNOLOGY');

// 3 workflow
s=header('02  /  Experience','The CRM journey, end to end','03');
txt(s,'The interface follows the natural order of customer work.',72,182,720,35,25,c.navy,true);
line(s,145,370,980,3,'#C8D8E5');
const flow=[['01','Sign in','Open your local workspace'],['02','Customer','Save a customer record'],['03','Opportunity','Set value and sales stage'],['04','Follow-up','Add due date and priority'],['05','Review','Read live insights']];
flow.forEach((v,i)=>{const x=72+i*225; box(s,x+54,330,78,78,i===4?c.gold:c.navy,39);txt(s,v[0],x+54,355,78,22,15,c.white,true,'center',sans);txt(s,v[1],x,432,186,26,18,c.navy,true,'center');txt(s,v[2],x,466,186,42,14,c.muted,false,'center',sans);});
box(s,72,565,1136,58,c.pale,10); txt(s,'Result',98,584,90,18,12,c.blue,true,'left',sans); txt(s,'Every saved action appears in its list view and drives the relevant dashboard and analytics output.',202,581,910,23,16,c.ink,false,'left',sans); footer(s,'02  CONNECTED WORKFLOW');

// 4 customer
s=header('03  /  Customers','A clearer customer workspace','04');
txt(s,'Customer details are easy to create, refine, find, and revisit.',72,182,740,37,26,c.navy,true);
box(s,72,250,512,320,c.white,18); txt(s,'CUSTOMER RECORD',102,282,320,18,11,c.blue,true,'left',sans); txt(s,'Capture the details\nthat matter.',102,318,310,70,29,c.navy,true); bullets(s,['Add and modify customer details','Search, filter, sort, and paginate','Tags, contact timeline, notes, and avatar'],102,420,420);
box(s,635,250,573,320,c.pale,18); txt(s,'RECORD LIFECYCLE',669,282,280,18,11,c.blue,true,'left',sans); const lifecycle=[['Create',c.blue],['Explore',c.jade],['Modify',c.gold],['Delete / Undo',c.coral]]; lifecycle.forEach((v,i)=>{const y=324+i*53;box(s,670,y,18,18,v[1],9);txt(s,v[0],706,y-2,185,22,17,c.ink,true,'left',sans);txt(s,['Add a verified customer record','Open the profile and activity history','Update fields, notes, and tags','Confirm removal with a recovery option'][i],878,y-1,275,28,13,c.muted,false,'left',sans);}); footer(s,'03  CUSTOMER MANAGEMENT');

// 5 pipeline tasks
s=header('04  /  Execution','Move deals forward. Keep promises.','05');
txt(s,'Pipeline and follow-up tools translate customer work into an action plan.',72,182,790,37,25,c.navy,true);
txt(s,'SALES PIPELINE',72,260,360,17,11,c.blue,true,'left',sans);
const stages=[['New lead',c.blue],['Qualified','#4E96A5'],['Proposal',c.gold],['Negotiation','#B9796A'],['Won',c.jade],['Lost',c.coral]];
stages.forEach((v,i)=>{const x=72+i*180; box(s,x,292,154,84,v[1],12);txt(s,v[0],x+13,320,128,20,15,c.white,true,'center',sans);txt(s,i<5?'→':'',x+158,318,20,20,17,c.gold,true,'center');});
box(s,72,435,1136,142,c.white,14);txt(s,'PRIORITY FOLLOW-UPS',102,462,300,18,11,c.blue,true,'left',sans);txt(s,'Tasks can be created, opened, edited, completed, or deleted.',102,492,540,27,18,c.navy,true,'left',sans); const task=[['High','Urgent customer action',c.coral],['Medium','Planned follow-up',c.gold],['Low','Routine work',c.jade]];task.forEach((v,i)=>{const x=708+i*160;box(s,x,470,126,28,'#F5F7F8',14);box(s,x+10,480,8,8,v[2],4);txt(s,v[0],x+28,477,88,14,11,v[2],true,'left',sans);txt(s,v[1],x,512,140,32,12,c.muted,false,'center',sans);});footer(s,'04  PIPELINE AND TASKS');

// 6 dashboard
s=header('05  /  Insight','Reporting built from user-entered records','06');
txt(s,'A visual dashboard keeps the current state of the workspace visible.',72,182,860,37,26,c.navy,true);
const metrics=[['Customers','Live count'],['Open pipeline','Live value'],['Open tasks','Needs action'],['Win rate','Decision ratio']];metrics.forEach((v,i)=>{const x=72+i*284;box(s,x,245,260,94,c.white,12);txt(s,v[0].toUpperCase(),x+20,265,210,16,10,c.muted,true,'left',sans);txt(s,v[1],x+20,292,210,25,19,c.navy,true);});
box(s,72,378,696,220,c.white,16);txt(s,'REVENUE PERFORMANCE',100,405,300,18,11,c.blue,true,'left',sans);txt(s,'Opportunity value by month',100,429,300,18,13,c.muted,false,'left',sans);[45,70,56,97,80,132].forEach((h,i)=>{box(s,112+i*90,554-h,46,h,i===5?c.navy:c.blue,5);txt(s,['May','Jun','Jul','Aug','Sep','Oct'][i],102+i*90,564,66,15,10,c.muted,false,'center',sans);});
box(s,800,378,408,220,c.pale,16);txt(s,'PRIORITY FOLLOW-UPS',830,405,300,18,11,c.blue,true,'left',sans);[['High priority first',c.coral],['Due-date indicators',c.gold],['Completion progress',c.jade]].forEach((v,i)=>{box(s,830,448+i*42,10,10,v[1],5);txt(s,v[0],854,442+i*42,210,25,16,c.ink,true,'left',sans);});footer(s,'05  REPORTING AND ANALYTICS');

// 7 quality
s=header('06  /  Product quality','A polished frontend experience','07');
txt(s,'The interface includes the small details that make a prototype feel complete.',72,182,950,37,25,c.navy,true);
const quality=[['Discover','Global and advanced search, saved filters, sorting, visible table columns, and pagination.'],['Control','Dashboard layouts, draggable widgets, theme switcher, language choice, profile details, and notification centre.'],['Communicate','Custom field validation, toasts, tooltips, keyboard shortcuts, and an optional guided walkthrough.'],['Recover','Delete confirmation and Undo for customer, opportunity, and task changes.'],['Export','CSV download, print-friendly reporting, and attachment-preview interface.'],['Access','Focus states, ARIA labels, keyboard navigation, password visibility, and strength feedback.']];
quality.forEach((v,i)=>{const col=i%2,row=Math.floor(i/2),x=72+col*566,y=250+row*112;box(s,x,y,538,88,row===1?c.pale:c.white,14);txt(s,v[0].toUpperCase(),x+22,y+18,120,15,10,c.blue,true,'left',sans);txt(s,v[1],x+22,y+40,490,36,14,c.ink,false,'left',sans);});footer(s,'06  FRONTEND QUALITY LAYER');

// 8 Close
s=P.slides.add();s.background.fill=c.navy; box(s,0,0,1280,720,c.navy);line(s,88,122,144,5,c.gold);txt(s,'CRM SYSTEM',88,76,500,22,13,'#A9C6DE',true,'left',sans);txt(s,'Thank you.',88,164,670,72,54,c.white,true);txt(s,'PEL CRM is ready for a live walkthrough.',92,264,700,34,25,'#DCEAF2',false,'left',sans);txt(s,'1. Add a customer\n2. Create an opportunity\n3. Add a priority follow-up\n4. Review the dashboard',92,367,460,132,20,c.white,false,'left',sans);box(s,824,160,300,350,'#173B61',24);txt(s,'LIVE REVIEW',858,204,220,18,11,c.gold,true,'left',sans);txt(s,'Customer data\nPipeline stages\nFollow-ups\nAnalytics',858,248,210,150,23,c.white,true);txt(s,'Built with HTML, CSS, and JavaScript.',858,432,210,32,14,'#A9C6DE',false,'left',sans);txt(s,'PEL CRM  •  FRONTEND PROJECT REVIEW',88,668,500,16,10,'#A9C6DE',true,'left',sans);

await (await PresentationFile.exportPptx(P)).save(out);
console.log(JSON.stringify({ out, slides: P.slides.length }));
