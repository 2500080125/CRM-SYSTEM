from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
import os

OUT='output/pdf/PEL_CRM_Project_Review_Professional_8_Pages_Technology_Updated.pdf'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
navy=colors.HexColor('#102A43'); ink=colors.HexColor('#1D3557'); blue=colors.HexColor('#3976A8'); gold=colors.HexColor('#C7A35A'); pale=colors.HexColor('#EAF1F5'); mist=colors.HexColor('#F4F7F8'); muted=colors.HexColor('#627D98'); jade=colors.HexColor('#2D7A71'); coral=colors.HexColor('#C86358')
styles=getSampleStyleSheet()
title=ParagraphStyle('title',parent=styles['Title'],fontName='Times-Bold',fontSize=30,leading=36,textColor=colors.white,alignment=TA_CENTER)
coverText=ParagraphStyle('coverText',parent=styles['BodyText'],fontName='Helvetica',fontSize=14,leading=20,textColor=colors.HexColor('#DCEAF2'),alignment=TA_CENTER)
kicker=ParagraphStyle('kicker',parent=styles['BodyText'],fontName='Helvetica-Bold',fontSize=9,leading=12,textColor=blue,spaceAfter=4)
h1=ParagraphStyle('h1',parent=styles['Heading1'],fontName='Times-Bold',fontSize=24,leading=28,textColor=navy,spaceAfter=8)
h2=ParagraphStyle('h2',parent=styles['Heading2'],fontName='Helvetica-Bold',fontSize=13,leading=17,textColor=blue,spaceBefore=8,spaceAfter=5)
body=ParagraphStyle('body',parent=styles['BodyText'],fontName='Helvetica',fontSize=10.3,leading=14.2,textColor=ink,spaceAfter=6)
small=ParagraphStyle('small',parent=body,fontSize=8.7,leading=11,textColor=muted)
cell=ParagraphStyle('cell',parent=body,fontSize=8.7,leading=11,textColor=ink)
head=ParagraphStyle('head',parent=cell,fontName='Helvetica-Bold',textColor=colors.white)
name=ParagraphStyle('name',parent=cell,fontName='Helvetica-Bold',textColor=navy)
def p(v,style=body): return Paragraph(v,style)
def bullets(items): return [p('• '+item,ParagraphStyle('b'+str(i),parent=body,leftIndent=12,firstLineIndent=-8,spaceAfter=5)) for i,item in enumerate(items)]
def page_header(canvas,doc):
    canvas.saveState(); canvas.setFillColor(navy); canvas.rect(0,0,210*mm,9*mm,fill=1,stroke=0)
    canvas.setFillColor(colors.white); canvas.setFont('Helvetica-Bold',7.8); canvas.drawString(18*mm,3*mm,'CRM SYSTEM  |  PEL CRM FRONTEND PROJECT REVIEW'); canvas.drawRightString(192*mm,3*mm,str(doc.page))
    if doc.page>1:
        canvas.setFillColor(gold); canvas.rect(18*mm,285*mm,35*mm,1.4*mm,fill=1,stroke=0)
    canvas.restoreState()
def feature_table(rows, widths=(43*mm,131*mm)):
    t=Table([[p(a,name),p(b,cell)] for a,b in rows],colWidths=list(widths))
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),pale),('BACKGROUND',(1,0),(1,-1),colors.white),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D8E1E8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8)])); return t
doc=SimpleDocTemplate(OUT,pagesize=A4,leftMargin=18*mm,rightMargin=18*mm,topMargin=17*mm,bottomMargin=17*mm)
story=[]
# Page 1
cover=Table([[p('CRM SYSTEM',ParagraphStyle('coverKick',parent=coverText,fontName='Helvetica-Bold',fontSize=10,textColor=colors.HexColor('#A9C6DE')))], [p('PEL',title)], [p('Customer relationship management',coverText)], [Spacer(1,13*mm)], [p('Professional frontend project review',ParagraphStyle('review',parent=coverText,fontName='Helvetica-Bold',fontSize=17,textColor=gold))], [Spacer(1,16*mm)], [p('HTML  •  CSS  •  JavaScript',coverText)], [p('Customers  •  Opportunities  •  Tasks  •  Analytics',coverText)]],colWidths=[174*mm],rowHeights=[20*mm,27*mm,16*mm,12*mm,16*mm,20*mm,15*mm,16*mm])
cover.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),navy),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('ALIGN',(0,0),(-1,-1),'CENTER'),('LEFTPADDING',(0,0),(-1,-1),20),('RIGHTPADDING',(0,0),(-1,-1),20)]))
story += [Spacer(1,37*mm),cover,PageBreak()]
# Page 2
story += [p('01  /  TECHNOLOGY',kicker),p('HTML, CSS, and JavaScript in PEL CRM',h1),p('The CRM uses three browser technologies. Together they create the structure, visual design, and working behaviour of the application.',body)]
story += [feature_table([('HTML: structure','HTML creates the login screen, navigation, customer and task forms, tables, buttons, labels, and accessible page content.'),('CSS: visual design','CSS creates the bright Monsoon interface, responsive layout, white content surfaces, priority colours, charts, and dark mode.'),('JavaScript: working behaviour','JavaScript handles login sessions, form validation, local record saving, search, edit and delete actions, notifications, and live reporting.'),('Frontend-only scope','The CRM runs in the browser with LocalStorage. It uses no backend, database, cloud service, or deployment.')]),Spacer(1,8*mm),p('Why these technologies matter',h2),p('HTML gives users a clear place to work. CSS makes that workspace readable and professional. JavaScript connects user actions to the records, dashboard, and analytics displayed in the browser.',body),PageBreak()]
# Page 3
story += [p('02  /  EXPERIENCE',kicker),p('Connected user workflow',h1),p('The CRM journey matches the order in which a user normally works with a customer.',body)]
workflow=[('01','Sign in','Open the local PEL workspace.'),('02','Customer','Save a customer record.'),('03','Opportunity','Set a deal value and sales stage.'),('04','Follow-up','Choose a due date, notes, and priority.'),('05','Review','Use live dashboard and analytics views.')]
t=Table([[p(n,head),p(a,name),p(b,cell)] for n,a,b in workflow],colWidths=[17*mm,46*mm,111*mm])
t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),navy),('BACKGROUND',(1,0),(-1,-1),colors.white),('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#D8E1E8')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LEFTPADDING',(0,0),(-1,-1),8)]));story += [t,Spacer(1,7*mm),p('Why the workflow matters',h2),p('Every saved record feeds the next relevant view. Customer records support opportunities and follow-ups; opportunities and tasks feed reporting; dashboard and analytics display the current browser-local data.',body),PageBreak()]
# Page 4
story += [p('03  /  CUSTOMERS',kicker),p('Customer workspace',h1),p('The customer feature is designed as a complete record workspace rather than a simple list.',body),feature_table([('Create','Add a customer using a clear vertical form and show the new record immediately in the Customers list.'),('Explore','Search and filter customers, sort columns, select visible columns, and use pagination controls.'),('Understand','Open a profile card with avatar initials, tags, notes, browser-local attachment preview, and contact activity timeline.'),('Modify','Edit customer fields, tags, notes, and contact activity directly from the record controls.'),('Recover','Use a delete confirmation and Undo option to recover from an accidental removal.')]),Spacer(1,6*mm),p('Local-first record handling',h2),p('Customer data and supported image previews remain in the current browser. This keeps the demonstration self-contained while making the interface feel interactive.',body),PageBreak()]
# Page 5
story += [p('04  /  EXECUTION',kicker),p('Sales pipeline and follow-ups',h1),p('Sales opportunities and customer follow-ups are the two action-oriented work areas of the CRM.',body),feature_table([('Pipeline','Create opportunities, set company, value, stage, and labels, then modify or delete them from the three-dot menu.'),('Kanban movement','Move opportunity cards across New lead, Qualified, Proposal, Negotiation, Won, and Lost stages through drag-and-drop.'),('Follow-ups','Create tasks with title, due date, priority, and notes; open them again to edit or remove them.'),('Priority logic','High-priority work is shown before Medium and Low tasks in the Priority follow-ups widget.'),('Calendar and badges','Use the calendar view, date badges, and task-completion controls to make pending work easy to identify.')]),PageBreak()]
# Page 6
story += [p('05  /  INSIGHT',kicker),p('Reporting and decision support',h1),p('Dashboard and analytics values are calculated from the records entered in the browser. No invented business data is needed for the review.',body)]
report=[('Revenue performance','Six-month value bars and a line chart based on saved opportunity values.'),('Pipeline by stage','Horizontal stage bars that reflect the current opportunity count in each pipeline stage.'),('Priority follow-ups','High-priority open tasks surface first, with due-date context.'),('Task completion','Completed versus open tasks appear as a progress chart.'),('Deal outcome','Won versus Lost opportunities appear as a simple donut chart.'),('Headline metrics','Customers, open pipeline value, open tasks, and win rate update from local records.')]
story += [feature_table(report),Spacer(1,7*mm),p('Dashboard controls',h2),p('The user can select a dashboard layout preset, reorder widgets, choose a theme, and use a time-based greeting. These controls are also saved locally.',body),PageBreak()]
# Page 7
story += [p('06  /  QUALITY',kicker),p('Professional frontend quality',h1),p('The final interface adds productivity and usability features that make the project feel complete during a live review.',body),feature_table([('Discover','Global and advanced search, saved filters, sortable tables, table-column controls, and pagination.'),('Communicate','Custom form validation, password visibility and strength feedback, success/warning/error toasts, and tooltips.'),('Control','Dashboard presets, widget ordering, three professional themes, language selector, profile panel, and notification centre.'),('Support','Keyboard shortcuts, focus states, ARIA labels, keyboard navigation, loading states, page transitions, and guided walkthrough.'),('Export','CSV download, print-friendly report styling, and export-preview interface.'),('Personalise','Profile avatar choices, user display details, time-based greeting, and local settings preview.')]),PageBreak()]
# Page 8
story += [p('07  /  TECHNOLOGY',kicker),p('Technology and live review close',h1),feature_table([('HTML','Creates the page structure, forms, navigation, tables, labels, accessible controls, and content hierarchy.'),('CSS','Creates the professional visual system, responsive layouts, monsoon-inspired themes, priority colours, and chart styling.'),('JavaScript','Powers local form saving, record editing, search, charts, notifications, keyboard controls, settings, and LocalStorage.')]),Spacer(1,10*mm),p('Suggested live walkthrough',h2)]
story += bullets(['Add a customer and show the new record.','Create an opportunity and move it to a pipeline stage.','Create a High-priority task and show it in Priority follow-ups.','Open Overview and Analytics to show reporting visuals.','Update profile settings and show the new account details.'])
story += [Spacer(1,14*mm),p('Thank you',ParagraphStyle('thank',parent=h1,fontSize=30,leading=35,textColor=navy,spaceBefore=5)),p('PEL CRM is ready for a professional frontend demonstration.',ParagraphStyle('end',parent=body,fontSize=14,leading=20,textColor=muted))]
doc.build(story,onFirstPage=page_header,onLaterPages=page_header)
print(OUT)
