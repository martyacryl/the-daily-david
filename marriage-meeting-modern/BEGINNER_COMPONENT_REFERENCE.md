# 🧩 Beginner's Guide to Component Reference

## 🎯 **What This Guide Is For**

This guide explains the **COMPONENT_REFERENCE.md** file in simple terms. Think of it as a "parts catalog" for the Marriage Meeting Tool - it lists all the different pieces that make up the app and explains what each one does.

---

## 🏗️ **What Are Components?**

### **Think of Components Like LEGO Blocks**
- **Components** = Individual LEGO pieces that you can snap together
- **Props** = Instructions that tell each piece how to behave
- **State** = What each piece remembers about itself

### **Real-World Example:**
Imagine you're building a house with LEGO:
- **Button Component** = A door that you can click to open/close
- **Input Component** = A window where you can type things
- **Card Component** = A room that holds other things inside it

---

## 📁 **The Main Categories of Components**

### **1. UI Components - "The Basic Building Blocks"**

These are like the basic LEGO pieces that everything else is built from.

#### **Button Component**
- **What it does**: Creates clickable buttons
- **What you see**: A button with text like "Save" or "Cancel"
- **How the app uses it**: Every time you click something, it's probably a button
- **Real example**: The "Add Task" button on your weekly planning page

#### **Card Component**
- **What it does**: Creates boxes that hold other content
- **What you see**: A rounded rectangle with a shadow that contains information
- **How the app uses it**: Almost every section uses cards to organize content
- **Real example**: The box that shows your family vision statement

#### **Input Component**
- **What it does**: Creates text boxes where you can type
- **What you see**: A rectangular box where you enter information
- **How the app uses it**: Every time you type something, it's in an input
- **Real example**: The box where you type your new goal

#### **Textarea Component**
- **What it does**: Creates larger text boxes for longer text
- **What you see**: A bigger rectangle for writing paragraphs
- **How the app uses it**: When you need to write more than a few words
- **Real example**: The box where you write your family vision statement

---

### **2. Layout Components - "The Room Arrangements"**

These decide how things are arranged on the page, like furniture placement in a room.

#### **Header Component**
- **What it does**: Creates the top navigation bar
- **What you see**: The bar at the top with your name and logout button
- **How the app uses it**: Every page has this same header
- **Real example**: The blue bar at the top of every page

#### **DailyFocusedLayout Component**
- **What it does**: Arranges the daily planning page
- **What you see**: The sidebar with different sections and the main content area
- **How the app uses it**: When you're planning your day, this organizes everything
- **Real example**: The layout when you click on a specific day

---

### **3. Feature Components - "The Main Functionality"**

These are the big pieces that do the main work of the app.

#### **WeeklyMeetingContent Component**
- **What it does**: Shows all the sections for weekly planning
- **What you see**: The schedule, tasks, prayers, grocery lists, etc.
- **How the app uses it**: This is the main content when you're planning your week
- **Real example**: The main area when you're on the weekly planning page

#### **GoalsSection Component**
- **What it does**: Manages all your goals
- **What you see**: Lists of your monthly, yearly, and long-term goals
- **How the app uses it**: When you want to add, edit, or view goals
- **Real example**: The section where you set your family goals

#### **TasksSection Component**
- **What it does**: Manages your to-do list
- **What you see**: Your tasks with checkboxes and priority levels
- **How the app uses it**: When you want to add or complete tasks
- **Real example**: The list where you add "Plan date night" or "Call mom"

---

### **4. Dashboard Components - "The Overview Pages"**

These show you summaries and overviews of your information.

#### **DashboardNew Component**
- **What it does**: Creates the main dashboard you see when you log in
- **What you see**: Today's overview, weather, goals, and quick actions
- **How the app uses it**: This is the first thing you see after logging in
- **Real example**: The main page with all your information cards

#### **WeeklyReview Component**
- **What it does**: Shows a summary of your week
- **What you see**: Accomplishments, growth areas, and progress metrics
- **How the app uses it**: When you want to see how your week went
- **Real example**: The page that shows "You completed 5 tasks this week"

---

### **5. Vision & Planning Components - "The Big Picture Stuff"**

These help you plan for the future and set your family's direction.

#### **AnnualPlanning Component**
- **What it does**: Lets you set your family's vision and annual goals
- **What you see**: Forms to enter your family vision, values, and priorities
- **How the app uses it**: When you want to plan for the whole year
- **Real example**: The page where you write "Our family values faith, love, and service"

#### **FamilyVisionBoard Component**
- **What it does**: Displays your family vision (read-only)
- **What you see**: Your family mission statement, values, and priorities
- **How the app uses it**: When you want to see your vision without editing it
- **Real example**: The display of your family vision on the vision page

---

## 🔄 **How Components Work Together**

### **The Flow of Information:**
1. **You click something** → A component responds
2. **You type something** → An input component captures it
3. **You save something** → A component sends it to the database
4. **You see something** → A component displays it

### **Real Example - Adding a Goal:**
1. **You click "Add Goal"** → Button component triggers an action
2. **A form appears** → Input component shows up for you to type
3. **You type your goal** → Input component captures your text
4. **You click "Save"** → Button component saves it
5. **Goal appears in list** → GoalsSection component displays it

---

## 🎯 **Key Concepts Explained Simply**

### **Props (Properties)**
- **What they are**: Instructions you give to a component
- **Real example**: Telling a button "make it blue" or "make it say 'Save'"
- **How you see it**: You don't see props directly, but they control how things look and behave

### **State**
- **What it is**: What a component remembers about itself
- **Real example**: A form remembers what you've typed, even if you haven't saved yet
- **How you see it**: When you type something and it stays there when you click elsewhere

### **Event Handlers**
- **What they are**: Instructions for what happens when you click or type
- **Real example**: "When someone clicks this button, save the form"
- **How you see it**: When you click something and something else happens

---

## 🛠️ **How to Use This Information**

### **If You Want to Change How Something Looks:**
1. Find the component in this guide
2. Look at the styling guide to see how to change colors, sizes, etc.
3. The component will tell you what you can customize

### **If You Want to Add New Functionality:**
1. Look at similar components to see how they work
2. Follow the same patterns for consistency
3. Update the documentation when you're done

### **If You Want to Understand How Something Works:**
1. Find the component in this guide
2. Read what it does and how the app uses it
3. Look at the real examples to see it in action

---

## 🔗 **Related Guides**

- **STYLING_GUIDE** - How to make components look good
- **FEATURES_OVERVIEW** - What the app can do overall
- **BEGINNER_GUIDE** - The main overview of all documentation

---

## 💡 **Quick Reference**

### **Most Important Components:**
- **Button** - For clicking things
- **Input** - For typing things
- **Card** - For organizing content
- **WeeklyMeetingContent** - The main planning area
- **DashboardNew** - The main overview page

### **Questions to Ask:**
- "What does this component do?"
- "How does it connect to other parts?"
- "What can I customize about it?"
- "When does the app use this component?"

Remember: Components are just building blocks. The magic happens when they work together to create the full app experience!
