from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
import os

OUT = 'output/pdf/PEL_CRM_Project_Review_Feature_Complete.pdf'
os.makedirs(os.path.dirname(OUT), exist_ok=True)
navy=colors.HexColor('#102A43'); blue=colors.HexColor('#2F5D8A'); gold=colors.HexColor('#D5A95E'); cream=colors.HexColor('#F8F7F3'); ink=colors.HexColor('#243B53'); muted=colors.HexColor('#627D98'); pale=colors.HexColor('#EEF3F8'); green=colors.HexColor('#2F7D62')
styles=getSampleStyleSheet()
title=ParagraphStyle('title',parent=styles['Title'],fontName='Times-Bold',fontSize=30,leading=35,textColor=colors.white,alignment=TA_CENTER,spaceAfter=10)
cover_sub=ParagraphStyle('cover_sub',parent=styles['BodyText'],fontName='Helvetica',fontSize=15,leading=20,textColor=colors.HexColor('#DDEAF5'),alignment=TA_CENTER)
h1=ParagraphStyle('h1',parent=styles['Heading1'],fontName='Times-Bold',fontSize=21,leading=25,textColor=navy,spaceBefore=4,spaceAfter=8)
h2=ParagraphStyle('h2',parent=styles['Heading2'],fontName='Helvetica-Bold',fontSize=13,leading=16,textColor=blue,spaceBefore=8,spaceAfter=4)
body=ParagraphStyle('body',parent=styles['BodyText'],fontName='Helvetica',fontSize=10.5,leading=15,textColor=ink,spaceAfter=6)
small=ParagraphStyle('small',parent=body,fontSize=9.2,leading=12,textColor=muted)
table_head=ParagraphStyle('table_head',parent=body,fontName='Helvetica-Bold',fontSize=8.7,leading=11,textColor=colors.white)
table_cell=ParagraphStyle('table_cell',parent=body,fontName='Helvetica',fontSize=8.5,leading=11,textColor=ink)
bullet=ParagraphStyle('bullet',parent=body,leftIndent=14,firstLineIndent=-8,bulletIndent=0,spaceAfter=5)
def P(t, style=body): return Paragraph(t,style)
def B(items): return [P('• '+x,bullet) for x in items]
def header_footer(canvas,doc):
    canvas.saveState(); canvas.setFillColor(navy); canvas.rect(0,0,210*mm,9*mm,fill=1,stroke=0); canvas.setFillColor(colors.white); canvas.setFont('Helvetica',8); canvas.drawString(18*mm,3*mm,'CRM SYSTEM  |  PEL CRM frontend review'); canvas.drawRightString(192*mm,3*mm,str(doc.page)); canvas.restoreState()
doc=SimpleDocTemplate(OUT,pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=14*mm,bottomMargin=18*mm)
story=[]
cover=Table([[P('CRM SYSTEM',ParagraphStyle('coverk',parent=cover_sub,fontName='Helvetica-Bold',fontSize=11,textColor=colors.HexColor('#AFC6D9')))], [P('PEL',title)], [P('Customer relationship management',cover_sub)], [Spacer(1,8*mm)], [P('Frontend project review',ParagraphStyle('review',parent=cover_sub,fontName='Helvetica-Bold',fontSize=17,textColor=gold))], [Spacer(1,14*mm)], [P('HTML, CSS and JavaScript project',cover_sub)], [P('Customers  •  Opportunities  •  Tasks  •  Analytics',cover_sub)]],colWidths=[174*mm],rowHeights=[15*mm,22*mm,13*mm,8*mm,13*mm,14*mm,12*mm,12*mm])
cover.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),navy),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('ALIGN',(0,0),(-1,-1),'CENTER'),('LEFTPADDING',(0,0),(-1,-1),20),('RIGHTPADDING',(0,0),(-1,-1),20)]))
story += [Spacer(1,45*mm),cover,PageBreak()]
story += [P('Project purpose',h1),P('PEL is a browser-based CRM workspace for managing customer relationships, sales opportunities, follow-ups, and performance reporting. The project keeps a connected user journey: saved actions appear in the relevant list, dashboard, and analytics view.',body),P('What the user can do',h2)] + B(['Sign in to a local workspace.','Add customer records and search or filter them.','Create opportunities with deal value and pipeline stage.','Add follow-ups with due dates, notes, and priority.','Use dashboard charts and analytics to review the saved records.'])
story += [P('Connected workflow',h1)]
flow=[['1','Sign in','Open PEL'],['2','Add customer','Save contact'],['3','New opportunity','Set value and stage'],['4','Add task','Set priority'],['5','Review','Dashboard and analytics']]
t=Table([[P(cell,table_cell) for cell in row] for row in flow],colWidths=[12*mm,40*mm,120*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),pale),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D9E2EC')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); story += [t]
story += [P('Completed interface improvements',h1)] + B(['Customer, opportunity, and task forms stack fields vertically for a clear top-to-bottom flow.','Add Customer, New Opportunity, Add Task, Save Task, Save Opportunity, Save Settings, search, notifications, profile controls, and logout work in the frontend.','Settings update the visible profile name and workspace details.','The login screen keeps the credential hint off the page.','The sidebar account control keeps the user name readable on the navy background.'])
story += [PageBreak(),P('Dashboard and analytics reporting',h1),P('Dashboard values use browser-local records entered during the demonstration. The reporting area does not use invented business data.',body)]
report=[['Area','Visual result','Data source'],['Revenue performance','Six monthly bars for opportunity values','Saved opportunities and their values'],['Pipeline by stage','Horizontal bars for New lead through Lost','Saved opportunity stages'],['Priority follow-ups','High priority work shown first, then Medium and Low','Open tasks and priority selection'],['Task completion','Completed and open task bars','Task checkbox status'],['Analytics metrics','Customers, opportunities, win rate, completion rate','Saved records']]
t=Table([[P(cell,table_head if row_index == 0 else table_cell) for cell in row] for row_index,row in enumerate(report)],colWidths=[39*mm,70*mm,65*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),navy),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D9E2EC')),('BACKGROUND',(0,1),(-1,-1),pale),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); story += [t]
story += [P('Completed frontend features',h1),P('The final review build extends the original CRM workflow with browser-local productivity and reporting features.',body)]
features=[['Workspace control','Collapsible sidebar, saved dashboard layout, widget ordering, time-based greeting, and Monsoon, Ocean, and Orchid themes.'],['Reporting','Revenue bars, six-month revenue line chart, pipeline stage bars, task progress, and a deal-outcome donut chart.'],['Record management','Tags, profile cards, notes, editable customer contact timeline, labels, drag-and-drop stages, modify, delete, and Undo.'],['Productivity','Calendar view, due-date badges, priority follow-ups, advanced search filters, saved customer filter, sorting, columns, and pagination.'],['Quality and support','Custom field errors, password tools, success/warning/error toasts, tooltips, keyboard shortcuts, walkthrough, notifications, and print view.'],['Local-first export','Image preview attachments, CSV download, Print-to-PDF, language controls, and LocalStorage persistence.']]
t=Table([[P(row[0],ParagraphStyle('feature_name',parent=table_cell,fontName='Helvetica-Bold')),P(row[1],table_cell)] for row in features],colWidths=[43*mm,131*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(0,-1),pale),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D9E2EC')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)])); story += [t]
story += [P('Frontend technology',h1)]
tech=[['HTML','Defines page structure, forms, navigation, tables, labels, and accessible buttons.'],['CSS','Creates the navy-and-cream professional theme, responsive layout, form design, chart bars, and priority colors.'],['JavaScript','Handles button actions, form submission, local storage, search, notifications, profile updates, charts, and analytics.']]
t=Table([[P(row[0],ParagraphStyle('tech_name',parent=table_cell,fontName='Helvetica-Bold')),P(row[1],table_cell)] for row in tech],colWidths=[35*mm,139*mm]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.white),('GRID',(0,0),(-1,-1),0.4,colors.HexColor('#D9E2EC')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)])); story += [t,Spacer(1,7*mm),P('Scope: frontend only. No backend, database, cloud service, or deployment is required for this review build.',ParagraphStyle('scope',parent=body,fontName='Helvetica-Bold',textColor=green))]
story += [PageBreak(),P('Review walkthrough',h1)] + B(['Open the local login screen and enter the project credentials.','Add a customer and show the saved customer record.','Create an opportunity, set its deal value and stage, then show it on Pipeline.','Create a High priority task and show it in Priority follow-ups.','Open Overview and Analytics to show the stage, revenue, and completion bars.','Open Settings, save a display name or workspace name, then show it in the profile menu.'])
story += [P('Thank you',ParagraphStyle('thanks',parent=h1,fontSize=30,leading=35,textColor=navy,spaceBefore=28)),P('PEL CRM is ready for a frontend demonstration of customer management, pipeline tracking, follow-ups, profile settings, and browser-local reporting.',ParagraphStyle('end',parent=body,fontSize=14,leading=20,textColor=muted))]
doc.build(story,onFirstPage=header_footer,onLaterPages=header_footer)
print(OUT)
