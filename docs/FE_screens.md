# Google Drive Clone – Screen & Component Architecture Specification

A comprehensive technical breakdown of all client-side screens, views, modals, and embedded UI components required to build a feature-complete Google Drive clone.

---

## 1. Authentication & Onboarding

### 1.1 Sign-In / Sign-Up Screen
* **Brand Header:** Logo, Application Title, Subtitle / Tagline.
* **Authentication Options:**
  * OAuth / Social Login buttons (Google, GitHub, Apple).
  * Divider (`OR`).
  * Email & Password input fields with real-time validation.
  * Password visibility toggle (`Show/Hide`).
  * Remember me checkbox.
  * Primary Action: **Sign In** / **Create Account** button.
* **Help Links:**
  * "Forgot Password?" trigger modal.
  * Switch between Sign In and Sign Up tabs.

---

## 2. Main Dashboard Layout (Global Shell)

The wrapper component present across all core application screens.

### 2.1 Top Navigation Header
* **Brand Section:** Logo, Application Title.
* **Search Bar:**
  * Instant search input with predictive auto-complete dropdown.
  * Search Filter Toggle Button (opens filter popover):
    * *Type:* Photos, Documents, Spreadsheets, Presentations, PDFs, Folders.
    * *Owner:* Anyone, Owned by me, Not owned by me, Specific user.
    * *Location:* Anywhere, My Drive, Shared with me, Trash.
    * *Date Modified:* Any time, Today, Last 7 days, Last 30 days, Custom range.
* **Right Control Utility:**
  * Help / Support icon dropdown.
  * Settings Gear menu icon (*Settings*, *Keyboard shortcuts*, *Download desktop app*).
  * Profile Avatar Button (Opens user profile popover with account switcher and **Sign Out** option).

### 2.2 Left Navigation Sidebar
* **Primary Creation CTA:**
  * `+ New` Floating Action Button (FAB) / Action Menu:
    * *Upload file*
    * *Upload folder*
    * *Separator*
    * *New Document*
    * *New Spreadsheet*
    * *New Presentation*
* **Core Navigation Menu Links:**
  * **My Drive** (expandable tree structure for folders)
  * **Shared with me**
  * **Recent**
  * **Starred**
  * **Trash / Bin**
* **Storage Meter Widget:**
  * Used storage progress bar (e.g., `5.4 GB of 15 GB used`).
  * Breakdown tooltips or details link.

---

## 3. Core File Storage & Management Screens

### 3.1 My Drive (Root & Subfolder Views)
* **Breadcrumb Navigation Bar:**
  * Current path indicators (e.g., `My Drive > Projects > 2026 > Client Proposals`).
  * Dropdown arrows on breadcrumb nodes for quick action context menus.
* **Toolbar / View Controls:**
  * View Toggle (Grid View vs. List View toggle buttons).
  * Sort Menu Dropdown (*Name*, *Last modified*, *Last modified by me*, *Last opened by me*, *File size*).
  * Information Panel Toggle Icon (opens right-side Info/Details Drawer).
* **Dropzone Overlay:**
  * Full-screen visual dropzone activated on file drag-over event with target state indicator.
* **Main Content Area (Folder & File Displays):**
  * **Folder Section:**
    * Grid / Row item cards displaying folder name, color tag, item count, and modified date.
  * **File Section:**
    * **Grid View:** Visual thumbnail previews, file type icon badges, file names, star indicator.
    * **List View Table:**
      * Columns: *Name*, *Owner*, *Last Modified*, *File Size*, *Actions*.
      * Multi-selection checkboxes per row.
      * Multi-select action bar (appears when items are checked: *Download*, *Delete*, *Move*, *Share*).

### 3.2 Context Menu (Triggered on Right-Click or Item Action Button)
* **Actions:**
  * *Open / Open with...*
  * *Share*
  * *Get link*
  * *Add shortcut to Drive*
  * *Move to* (opens folder tree selector modal)
  * *Add to Starred / Remove from Starred*
  * *Rename*
  * *Change color* (for folders)
  * *Make a copy*
  * *Download*
  * *Move to Trash*

### 3.3 Shared with Me Screen
* **Filter Chips:**
  * Filter buttons at top (*People*, *Type*, *Modified date*).
* **Grouping Layout:**
  * Items grouped chronologically or by sharing user (e.g., "Shared by Sarah Jenkins", "Shared earlier this week").
* **Item Rows / Cards:**
  * Standard file/folder representation with sharer's avatar and timestamp overlay.

### 3.4 Recent Screen
* **Chronological Section Headers:**
  * *Today*, *Yesterday*, *Earlier this week*, *Earlier this month*, *Earlier this year*.
* **List Display:**
  * Files ordered strictly by `last_accessed_at` timestamp.

### 3.5 Starred Screen
* **Quick Access Grid/List:**
  * Displays all starred files and folders across all directories.
* **Empty State:**
  * Custom graphic illustration with "No starred files yet" callout.

### 3.6 Trash / Bin Screen
* **Alert / Warning Header:**
  * Informational banner: *"Items in trash are deleted forever after 30 days"*.
  * Primary Action: **Empty trash** button.
* **Trash Item Context Menu:**
  * *Restore*
  * *Delete forever*

---

## 4. File Interactivity, Modals & Drawers

### 4.1 File Preview Overlay / Modal
* **Top Bar Controls:**
  * Back / Close button.
  * File Title & Icon.
  * Star toggle.
  * Primary Actions: *Print*, *Download*, *Share*, *More Options* menu.
* **Viewer Canvas:**
  * Specialized renderer based on MIME type:
    * **PDF Viewer:** Page navigation controls, zoom level, fit-to-width/page.
    * **Image Viewer:** Pan/zoom controls, background contrast toggle.
    * **Video Player:** Playback controls, resolution switcher, scrub bar.
    * **Audio Player:** Waveform / timeline, volume control, play/pause.
    * **Code / Text Viewer:** Syntax highlighter, line numbers.
* **Comments Sidebar (Collapsible):**
  * Threaded comment history.
  * Add Comment Box (supports rich text and `@mention` tagging).
  * Resolved / Open thread toggle.

### 4.2 Sharing & Permissions Modal
* **Header:** Item title and share icon.
* **People Access Section:**
  * User/Group search input field with live email auto-complete.
  * Role assignment dropdown (*Viewer*, *Commenter*, *Editor*).
  * Expiration date picker for temporary access.
  * List of current collaborators with avatars, names, emails, and current roles.
  * Ability to transfer ownership or remove access.
* **General Access Section:**
  * Privacy dropdown (*Restricted*, *Anyone with the link*).
  * Permission level for general access users (*Viewer*, *Commenter*, *Editor*).
* **Footer Actions:**
  * **Copy link** button.
  * **Done / Save** button.

### 4.3 File Details & Activity Panel (Right Sidebar)
* **Tab 1: Details**
  * Thumbnail Preview box.
  * File System Properties: *Type*, *Size*, *Storage Used*, *Location*, *Owner*, *Created*, *Modified*, *Opened*.
  * Description input field (editable).
  * Download permissions toggle (*Prevent viewers from downloading*).
* **Tab 2: Activity**
  * Audit Trail Timeline:
    * Activity cards showing user avatar, action name (*Edited*, *Renamed*, *Shared*, *Moved*, *Uploaded*), and relative timestamp.

### 4.4 File Upload Progress Drawer
* **Floating Bottom-Right Widget:**
  * Header with total upload status (e.g., "Uploading 3 items", "3 uploads complete").
  * Minimize / Close controls.
* **Item Upload Rows:**
  * File name and type icon.
  * Progress Bar with percentage and upload speed.
  * Cancel, Pause, or Retry buttons per item.
  * Success / Error status indicators.

---

## 5. Account & Administration

### 5.1 Settings Screen
* **Navigation Tabs / Categories:**
  * **General:**
    * Storage breakdown summary.
    * Language & Region settings.
    * Density option (*Comfortable*, *Cozy*, *Compact*).
    * Start page default dropdown (*Home*, *My Drive*).
  * **Notifications:**
    * Email notification toggles (Shares, Comments, Requests).
    * Browser push notification permissions toggle.
  * **Manage Apps:**
    * List of authorized third-party extensions/apps.
    * "Disconnect from Drive" action triggers.

### 5.2 Admin Dashboard (Enterprise / Multi-Tenant Edition)
* **System Metrics Overview:**
  * Total active users, storage consumed globally, file count metrics.
* **User Management View:**
  * User table: *Name*, *Email*, *Role*, *Storage Quota Used*, *Status*.
  * Create/Delete user triggers, edit storage quotas.
* **Security & Audit Logs:**
  * Event table tracking global logins, external file sharing events, and bulk deletions.