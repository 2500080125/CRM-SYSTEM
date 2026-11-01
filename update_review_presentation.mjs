import fs from 'node:fs/promises';
import path from 'node:path';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const root = process.cwd();
const build = path.join(root, '.build-review-update');
await fs.mkdir(build, { recursive: true });
await fs.mkdir(path.join(root, 'output', 'pptx'), { recursive: true });
const out = path.join(root, 'output', 'pptx', 'PEL_CRM_Project_Review_Feature_Complete.pptx');
const P = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const navy = '#102A43', blue = '#2F5D8A', gold = '#D5A95E', cream = '#F8F7F3', ink = '#243B53', muted = '#627D98', pale = '#EEF3F8', green = '#2F7D62';
const font = 'Georgia';

function text(slide, value, x, y, w, h, size = 22, color = ink, bold = false, align = 'left') {
  const shape = slide.shapes.add({ geometry: 'textbox', position: { left: x, top: y, width: w, height: h }, fill: 'none', line: { fill: 'none', width: 0 } });
  shape.text = value; shape.text.style = { typeface: font, fontSize: size, color, bold, align, autoFit: 'shrink' }; return shape;
}
function rect(slide, x, y, w, h, fill, radius = 12) { return slide.shapes.add({ geometry: radius ? 'roundRect' : 'rect', position: { left: x, top: y, width: w, height: h }, fill, line: { fill, width: 0 }, radius }); }
function header(title, kicker) { const s = P.slides.add(); s.background.fill = cream; rect(s, 0, 0, 1280, 14, navy, 0); text(s, kicker.toUpperCase(), 72, 42, 1000, 22, 13, blue, true); text(s, title, 72, 76, 1080, 55, 35, navy, true); text(s, 'PEL CRM', 1080, 44, 125, 22, 13, gold, true, 'right'); return s; }
function bullet(slide, value, x, y, w, color = ink) { text(slide, '•  ' + value, x, y, w, 34, 19, color); }
function metric(slide, label, value, note, x, y, w, accent = blue) { rect(slide, x, y, w, 128, '#FFFFFF'); text(slide, label.toUpperCase(), x + 22, y + 20, w - 44, 18, 11, muted, true); text(slide, value, x + 22, y + 50, w - 44, 34, 27, navy, true); text(slide, note, x + 22, y + 91, w - 44, 20, 12, accent); }

let s = P.slides.add(); s.background.fill = navy;
text(s, 'CRM SYSTEM', 92, 100, 500, 28, 17, '#9DC5E7', true);
text(s, 'PEL', 92, 150, 700, 70, 52, '#FFFFFF', true);
text(s, 'Customer relationship management', 96, 230, 750, 38, 25, '#DDEAF5');
text(s, 'Frontend project review', 96, 305, 750, 36, 25, gold);
rect(s, 96, 410, 142, 5, gold, 0);
text(s, 'HTML, CSS and JavaScript project', 96, 455, 740, 34, 20, '#DDEAF5');
text(s, 'Customers • Opportunities • Tasks • Analytics', 96, 505, 850, 34, 20, '#AFC6D9');

s = header('Project purpose', '01  Overview');
text(s, 'PEL brings customer work into one clear browser workspace.', 72, 160, 1020, 52, 31, navy, true);
bullet(s, 'Create customer records and keep them visible in a searchable list.', 92, 255, 960);
bullet(s, 'Create sales opportunities, place them in pipeline stages, and track deal value.', 92, 305, 1020);
bullet(s, 'Create follow-ups with dates, notes, and High, Medium, or Low priority.', 92, 355, 1000);
bullet(s, 'Review live dashboard metrics, revenue bars, pipeline bars, and priority work.', 92, 405, 1000);
rect(s, 72, 495, 1136, 108, pale); text(s, 'Frontend-only scope', 96, 520, 290, 24, 18, blue, true); text(s, 'The project runs locally in the browser. JavaScript stores workspace records locally so every action updates the visible CRM screens.', 96, 553, 1050, 32, 18, ink);

s = header('Connected user workflow', '02  Core flow');
const steps = [['01','Sign in','Open the local PEL workspace'],['02','Add customer','Save a customer record'],['03','Create opportunity','Set value and pipeline stage'],['04','Add follow-up','Set due date and priority'],['05','Review insight','Use dashboard and analytics']];
steps.forEach((item, i) => { const x = 58 + i * 237; rect(s, x, 220, 205, 220, i === 4 ? '#E5EEF7' : '#FFFFFF'); text(s, item[0], x + 20, 244, 80, 22, 14, gold, true); text(s, item[1], x + 20, 292, 165, 42, 21, navy, true); text(s, item[2], x + 20, 350, 165, 55, 15, muted); if (i < 4) text(s, '›', x + 209, 314, 26, 40, 28, gold, true, 'center'); });
text(s, 'Each saved record feeds the relevant list, dashboard summary, and analytics view.', 72, 535, 1080, 32, 21, green, true);

s = header('Interactive CRM features', '03  What changed');
const features = [['Customer management','Add Customer form, searchable customer table, status filtering, browser-local persistence'],['Pipeline management','New Opportunity form, six editable stages, value tracking, stage updates'],['Task management','Add Task form, due date, notes, priority, completion checkbox, priority ordering'],['Workspace controls','Search, notifications, profile menu, profile details, settings save, logout'],['Reliable interface','Vertical record forms, feedback toasts, empty states, mobile-aware layout']];
features.forEach((item, i) => { const y = 160 + i * 85; rect(s, 72, y, 1136, 66, i % 2 ? '#FFFFFF' : pale, 8); text(s, item[0], 96, y + 18, 285, 25, 18, navy, true); text(s, item[1], 390, y + 18, 770, 29, 16, muted); });

s = header('Dashboard and analytics', '04  Visual reporting');
metric(s, 'Customers', 'Live count', 'Saved customer records', 72, 156, 250);
metric(s, 'Open pipeline', 'Live value', 'Saved open opportunities', 342, 156, 250);
metric(s, 'Open tasks', 'Live count', 'Tasks waiting for action', 612, 156, 250);
metric(s, 'Win rate', 'Live ratio', 'Won vs. closed deals', 882, 156, 250);
rect(s, 72, 330, 655, 250, '#FFFFFF'); text(s, 'Revenue performance', 98, 358, 300, 25, 20, navy, true); text(s, 'Six-month deal-value bars update from saved opportunities.', 98, 390, 480, 20, 14, muted);
[40,66,52,88,72,108].forEach((h,i)=> { rect(s, 110 + i*82, 528-h, 44, h, i===5 ? navy : blue, 5); text(s, ['Apr','May','Jun','Jul','Aug','Sep'][i], 106+i*82, 540, 52, 18, 11, muted, false, 'center'); });
rect(s, 752, 330, 456, 250, '#FFFFFF'); text(s, 'Priority follow-ups', 778, 358, 280, 25, 20, navy, true); text(s, 'High priority tasks appear first.', 778, 390, 320, 20, 14, muted);
[['High','Call customer', '#B94F45'],['Medium','Send proposal', '#C58A22'],['Low','Update notes', '#2F7D62']].forEach((row,i)=> { const y=436+i*42; rect(s, 780, y+5, 10, 10, row[2], 5); text(s,row[1],804,y,220,22,15,ink,true); text(s,row[0],1070,y,100,22,13,row[2],true,'right'); });

s = header('Completed frontend features', '05  Feature update');
const finalFeatures = [
  ['Workspace control','Collapsible sidebar, dashboard layout presets, widget ordering, time-based greeting, and three saved professional themes.'],
  ['Reporting','Revenue bars, a six-month SVG line chart, opportunity stage bars, task progress, and a deal-outcome donut chart.'],
  ['Record management','Customer tags and profiles, notes, editable contact timeline, pipeline labels, drag-and-drop stages, edit, delete, and Undo.'],
  ['Productivity','Task calendar, due-date badges, priority follow-ups, advanced record search, saved customer filters, sort, columns, and pagination.'],
  ['Quality and support','Custom form messages, password visibility and strength, toasts, tooltips, keyboard shortcuts, walkthrough, notifications, and print view.'],
  ['Local-first data','Image attachment previews, CSV download, Print-to-PDF, language controls, and browser-local persistence without backend services.']
];
finalFeatures.forEach((item, i) => { const y = 148 + i * 76; rect(s, 72, y, 1136, 58, i % 2 ? '#FFFFFF' : pale, 8); text(s, item[0], 96, y + 16, 250, 24, 16, navy, true); text(s, item[1], 360, y + 15, 810, 30, 14, muted); });

s = header('Frontend architecture', '06  Technology');
const tech = [['HTML','Page structure, forms, navigation, tables, labels, and accessible controls'],['CSS','Navy-and-cream visual system, responsive layout, forms, charts, bars, and status styling'],['JavaScript','Button behavior, form saving, search, notifications, charts, profile updates, and LocalStorage']];
tech.forEach((item,i)=> { const x=72+i*378; rect(s,x,188,342,240,i===2?'#E9F2F8':'#FFFFFF'); text(s,item[0],x+26,220,280,36,27,navy,true); rect(s,x+26,274,70,4,i===1?gold:blue,0); text(s,item[1],x+26,304,285,82,17,muted); });
text(s, 'No backend, database, deployment, or cloud service is required for this frontend review build.', 72, 505, 1060, 32, 20, green, true);

s = P.slides.add(); s.background.fill = navy;
text(s, 'CRM SYSTEM', 92, 110, 720, 26, 16, '#9DC5E7', true); text(s, 'Thank you', 92, 195, 780, 70, 54, '#FFFFFF', true); text(s, 'PEL CRM frontend project review', 96, 285, 720, 34, 25, '#DDEAF5'); rect(s, 96, 365, 150, 5, gold, 0); text(s, 'Ready for a live walkthrough of customers, opportunities, tasks, dashboard reporting, and analytics.', 96, 425, 930, 54, 24, '#DDEAF5');

await (await PresentationFile.exportPptx(P)).save(out);
console.log(JSON.stringify({ out, slides: P.slides.length }));
