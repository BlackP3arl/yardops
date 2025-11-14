Project Name: yardops
Goal: Build a full-stack web application to automate meter reading management at the MTCC Boat Yard.

⸻

⚙️ 1. Overview

YardOps is a simple and efficient meter reading management system for the boat yard.
The yard has multiple meters (water and electric) placed in different locations.
Each meter has:
	•	a unique meter number
	•	a meter type (Water / Electric)
	•	a location
	•	a reading frequency (Daily / Weekly / Monthly / Ad-hoc)

Different staff are assigned to different meters to take readings and update them in the system.

⸻

🧩 2. Functional Requirements

User Roles
	1.	Admin
	•	Manage users (add/remove, assign roles)
	•	Create and manage locations
	•	Create and manage meters
	•	Assign meters to one or more users
	•	Define reading frequency
	•	Schedule readings
	•	View overall status (missed/delayed readings, per meter/person)
	•	Send notifications/reminders to readers
	2.	Meter Reader
	•	Login to personal dashboard
	•	View assigned meters
	•	See To-Do list for meters needing readings today/this week
	•	Enter meter reading with:
	•	Value
	•	Date/time
	•	Optional comment
	•	View past readings and missed ones
	•	Receive notifications when assigned or overdue

2.	Meter Reader
	•	Login to personal dashboard
	•	View assigned meters
	•	See To-Do list for meters needing readings today/this week
	•	Enter meter reading with:
	•	Value
	•	Date/time
	•	Optional comment
	•	View past readings and missed ones
	•	Receive notifications when assigned or overdue

 3. UI / UX Design

Use Next.js 14 + Tailwind CSS (or Ant Design)
Style should be clean, dashboard-like, mobile responsive.

Admin Dashboard Widgets:
	•	Total meters (by type)
	•	Readings done vs pending (chart)
	•	Missed readings (list by meter/person)
	•	Frequency breakdown (daily/weekly/monthly)
	•	Table: “Top Delayed Meters / Readers”

Reader Dashboard Widgets:
	•	“To-Do” meters for today/week
	•	“Missed Readings” count
	•	“History” of submitted readings
	•	“Notifications” panel

Forms:
	•	Add Location
	•	Add Meter
	•	Assign Meter to User
	•	Enter Reading
	•	Add Comment

⸻

🔔 4. Notification System
	•	When Admin schedules readings, the assigned user receives a notification
	•	Notification types:
	•	New assignment
	•	Reading due
	•	Reading missed
	•	Store notifications in DB
	•	Optional email notification integration (Nodemailer)

⸻

📊 5. Reporting & Exports
	•	Export readings as CSV or PDF (for a selected period)
	•	Filter by:
	•	Location
	•	Reader
	•	Meter Type
	•	Frequency
	•	Date Range
