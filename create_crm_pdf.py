from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle

OUT='output/pdf/CRM_System_Project_Guide.pdf'
doc=SimpleDocTemplate(OUT,pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=16*mm,bottomMargin=16*mm)
styles=getSampleStyleSheet(); navy=colors.HexColor('#102A43'); blue=colors.HexColor('#2563EB'); teal=colors.HexColor('#0F766E'); muted=colors.HexColor('#52606D'); pale=colors.HexColor('#F4F7FB'); orange=colors.HexColor('#D97706'); red=colors.HexColor('#B91C1C')
title=ParagraphStyle('title',parent=styles['Title'],fontName='Times-Bold',fontSize=26,leading=31,textColor=navy,spaceAfter=10)
h1=ParagraphStyle('h1',parent=styles['Heading1'],fontName='Times-Bold',fontSize=18,leading=22,textColor=navy,spaceBefore=12,spaceAfter=8)
h2=ParagraphStyle('h2',parent=styles['Heading2'],fontName='Times-Bold',fontSize=12,leading=15,textColor=blue,spaceBefore=8,spaceAfter=4)
body=ParagraphStyle('body',parent=styles['BodyText'],fontName='Times-Roman',fontSize=11,leading=15,textColor=colors.HexColor('#243B53'),spaceAfter=6)
bullet=ParagraphStyle('bullet',parent=body,leftIndent=14,firstLineIndent=-8,bulletIndent=0)
def P(txt,style=body): return Paragraph(txt,style)
def bullets(items): return [P('• '+x,bullet) for x in items]
def header_footer(canvas,doc):
    canvas.saveState(); canvas.setStrokeColor(colors.HexColor('#D9E2EC')); canvas.line(18*mm,12*mm,192*mm,12*mm)
    canvas.setFont('Times-Roman',8); canvas.setFillColor(muted); canvas.drawString(18*mm,7*mm,'CRM System | Frontend project guide'); canvas.drawRightString(192*mm,7*mm,f'{doc.page}')
    canvas.restoreState()

story=[]
story += [Spacer(1,22*mm),P('CRM SYSTEM',ParagraphStyle('k',parent=body,fontName='Helvetica-Bold',fontSize=11,textColor=blue)),P('Frontend project guide',title),P('What to build, what to avoid, and how to finish tonight',ParagraphStyle('sub',parent=body,fontSize=15,leading=20,textColor=muted)),Spacer(1,16*mm),P('Project focus',h2),P('A responsive CRM dashboard that helps a sales team see customers, track interactions, move deals through a pipeline, and manage follow-ups.',body),Spacer(1,14*mm),P('<b>Recommended target:</b> a polished frontend MVP using realistic sample data and LocalStorage.',body),PageBreak()]
story += [P('1. Project objective',h1),P('The CRM should feel like one connected product. A user should be able to create a customer, create a deal, move the deal through the sales pipeline, schedule a follow-up, and see the dashboard story change.',body),P('2. Minimum viable product',h1)] + bullets(['Dashboard with KPIs, charts, recent activity, and upcoming follow-ups','Customer list with search, filters, add, edit, delete, and profile view','Sales pipeline with stages from New Lead to Won or Lost','Tasks and reminders with due dates, priorities, and completion states','Responsive navigation, validation, toast feedback, and LocalStorage persistence'])
story += [P('3. Recommended screens',h1)] + bullets(['Login','Dashboard','Customers','Customer profile','Sales pipeline','Tasks and reminders','Analytics','Settings'])
story += [PageBreak(),P('4. Core data fields',h1)]
data=[['Entity','Important fields'],['Customer','Name, email, company, status, salesperson, deal value, last interaction, next follow-up'],['Deal','Deal name, customer, value, probability, stage, expected close date'],['Task','Title, customer, due date, priority, status, notes'],['Interaction','Type, customer, date, description, assigned user, status']]
t=Table(data,colWidths=[35*mm,135*mm]); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D9E2EC')),('BACKGROUND',(0,1),(-1,-1),pale),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); story += [t,Spacer(1,10),P('5. What to do',h1)] + bullets(['Start with a wireframe and a small design system.','Create reusable components for tables, cards, modals, buttons, and badges.','Use one central state source for customers, deals, tasks, and activities.','Use realistic records so search, filters, charts, and empty states have meaning.','Validate forms and show clear feedback for success, errors, empty states, and overdue work.','Test the full user journey from login to customer creation to pipeline movement to task completion.'])
story += [P('6. What not to do',h1)] + bullets(['Do not build a backend, real email sender, or complex authentication for a frontend-only submission.','Do not create pages whose buttons do nothing.','Do not overcrowd the dashboard with every metric at once.','Do not use fake numbers without labels, units, or a clear meaning.','Do not copy a generic admin template without connecting the workflows.','Do not add advanced features until the MVP works on desktop and mobile.','Do not leave broken routes, console errors, placeholder text, or unfinished forms.'])
story += [PageBreak(),P('7. Build order for tonight',h1)]
plan=[['Phase','Output','Time'],['1. Setup','React + Vite, routing, theme','45 min'],['2. Shell','Sidebar, topbar, responsive layout','45 min'],['3. Data','Sample records, central state, LocalStorage','60 min'],['4. Core flow','Customers, profile, pipeline','2 hr 45 min'],['5. Finish','Tasks, charts, validation, testing','2 hr 15 min']]
t=Table(plan,colWidths=[30*mm,105*mm,25*mm]); t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),blue),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),9),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D9E2EC')),('BACKGROUND',(0,1),(-1,-1),pale),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); story += [t,Spacer(1,10),P('Focused MVP time: approximately 7–8 hours.',ParagraphStyle('call',parent=body,fontName='Helvetica-Bold',fontSize=13,textColor=orange)),P('8. Technology recommendation',h1)] + bullets(['React with Vite','React Router','Tailwind CSS or Bootstrap','Recharts','Lucide React','Context API or Zustand','LocalStorage','React Hook Form'])
story += [P('9. Submission checklist',h1)] + bullets(['All main routes open without errors','Desktop and mobile layouts checked','Customer, deal, and task actions visibly work','Search and filters return correct records','Charts use labelled, understandable data','Forms reject missing or invalid values','No console errors or dead buttons','Screenshots captured for the report','README explains how to run the project'])
story += [P('10. Final recommendation',h1),P('Submit a focused CRM MVP that proves the complete workflow. Optional features such as email campaigns, dark mode, export, calendar views, and role-based UI should come only after the core flow works.',body),P('<b>Demo story:</b> create a customer, create a deal, move it through the pipeline, schedule a follow-up, complete the task, and show the updated dashboard.',body)]
doc.build(story,onFirstPage=header_footer,onLaterPages=header_footer)
print(OUT)
