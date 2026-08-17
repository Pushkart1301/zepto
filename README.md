# 🚀 Zepto Support — AI-Powered Customer Support & Ticket Management System


An intelligent customer-support platform designed for **Zepto** to streamline ticket creation, classification, prioritization, assignment, tracking, and resolution.

The system combines a modern support dashboard with a **FastAPI backend, React frontend, AI-assisted ticket intelligence, and Docker-based deployment** to create a scalable support workflow.

---

## 📌 Problem Statement

Quick-commerce platforms such as Zepto handle a large volume of customer-support requests every day.

Common issues include:

* Missing or incorrect items
* Delayed deliveries
* Refund and payment problems
* Order cancellations
* Damaged products
* Delivery-partner issues
* Account-related problems
* Other customer complaints

Handling these requests manually can result in:

* Long response times
* Incorrect ticket prioritization
* Tickets being assigned to the wrong team
* Repetitive manual work
* Poor visibility into support performance
* Difficulty identifying high-priority or recurring issues

### Our Solution

**Zepto Support** provides a centralized support platform that helps support teams:

1. Create and manage customer tickets
2. Automatically understand ticket information
3. Categorize and prioritize issues
4. Route tickets to the appropriate support workflow
5. Track ticket status and lifecycle
6. Monitor support KPIs through a dashboard
7. Provide actionable insights to support teams

---

# 🎯 Key Features

## 🎫 Intelligent Ticket Management

Support agents can manage tickets through a centralized interface.

Each ticket can contain information such as:

* Ticket ID
* Customer information
* Order information
* Issue category
* Priority
* Status
* Assigned team/agent
* Description
* Created timestamp
* Updated timestamp

Tickets can be tracked throughout their complete lifecycle.

---

## 🤖 AI-Assisted Support

The platform includes an AI layer designed to assist support operations.

AI can be used to help:

* Understand customer complaints
* Categorize issues
* Identify priority
* Extract relevant information
* Recommend appropriate actions
* Reduce repetitive manual work

The AI architecture is separated from the core API so that intelligence-related functionality can evolve independently.

---

## 📊 Support Dashboard

The dashboard provides an operational overview of the support system.

Important metrics include:

* Total tickets
* Open tickets
* Resolved tickets
* Pending tickets
* High-priority tickets
* Ticket distribution
* Support workload
* Resolution trends

This gives support teams a quick understanding of the current support situation.

---

## 🔎 Ticket Search & Filtering

Agents can efficiently find tickets using filters such as:

* Ticket status
* Priority
* Category
* Assignment
* Ticket ID
* Customer/order information

This is particularly useful when dealing with a large number of support requests.

---

## ⚡ Priority-Based Support

Tickets can be prioritized so that urgent customer issues receive attention first.

Example priority levels:

| Priority | Description             |
| -------- | ----------------------- |
| 🔴 P1    | Critical / urgent issue |
| 🟠 P2    | High-priority issue     |
| 🟡 P3    | Normal issue            |
| 🟢 P4    | Low-priority issue      |

This allows support teams to focus their effort where it matters most.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      Customer        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Support Interface  │
                         │   React + TypeScript │
                         └──────────┬───────────┘
                                    │
                              REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     FastAPI Backend  │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌────────────┐     ┌────────────┐     ┌────────────┐
          │ Ticket API │     │ AI Layer   │     │ Services   │
          └────────────┘     └────────────┘     └────────────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Data Layer       │
                         └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* React 18
* TypeScript
* Vite

The frontend is structured into reusable components, services, and type definitions.

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* Pandas
* NumPy
* Python Dotenv

The backend is organized into API, AI, models, and service layers.

## DevOps

* Docker
* Docker Compose

The repository includes separate Docker services for the backend and frontend. The backend runs on port `8000`, while the frontend runs on port `5173`.

---

# 📁 Project Structure

```text
zepto-ticket/
│
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Python 3.10+
* Node.js 18+
* npm
* Docker Desktop *(optional, recommended)*

---

# ⚙️ Option 1 — Run Using Docker

Clone the repository:

```bash
git clone https://github.com/Pushkart1301/zepto-ticket.git
cd zepto-ticket
```

Create the environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

On Windows PowerShell, you can copy them using:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Then start the complete application:

```bash
docker compose up --build
```

The services will be available at:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:8000
```

Docker Compose configures the frontend and backend as separate services.

To stop the application:

```bash
docker compose down
```

---

# 🐍 Option 2 — Run Backend Locally

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```powershell
Copy-Item .env.example .env
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

```text
http://localhost:8000
```

FastAPI dependencies are defined in the repository's requirements configuration.

---

# ⚛️ Run Frontend Locally

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Create the production build:

```bash
npm run build
```

The frontend uses React 18, TypeScript and Vite.

---

# 🔐 Environment Variables

Environment variables are intentionally kept outside source control.

Backend:

```text
backend/.env
```

Frontend:

```text
frontend/.env
```

Use the provided `.env.example` files as templates.

> ⚠️ Never commit API keys, database credentials, authentication secrets, or other sensitive credentials to GitHub.

---

# 🔄 Ticket Lifecycle

```text
Customer Issue
      │
      ▼
Ticket Created
      │
      ▼
AI / Rule-Based Analysis
      │
      ├── Category
      ├── Priority
      └── Routing
      │
      ▼
Assigned to Support
      │
      ▼
Investigation
      │
      ▼
Resolution
      │
      ▼
Ticket Closed
```

This workflow allows the support team to move from raw customer complaints to structured, actionable support cases.

---

# 📈 Why This Helps Zepto

### 1. Faster Support

Automating repetitive ticket-processing tasks can reduce the time agents spend manually understanding and organizing requests.

### 2. Better Prioritization

Critical customer issues can be surfaced earlier instead of being treated the same as low-impact requests.

### 3. Better Agent Productivity

Agents get structured information instead of having to interpret every request from scratch.

### 4. Operational Visibility

A centralized dashboard makes it easier for support managers to understand ticket volumes, workloads and resolution performance.

### 5. Scalable Architecture

The frontend and backend are independently structured and containerized, making the system easier to extend and deploy.

---

# 🧪 Testing

Backend tests are located inside:

```text
backend/tests/
```

Run the test suite from the backend environment using the project's configured test runner.

Before submitting a build, verify:

* Ticket creation
* Ticket retrieval
* Ticket updates
* Status changes
* Priority changes
* Dashboard metrics
* AI functionality
* Frontend/backend API communication
* Docker startup

---

# 🐳 Docker Services

The application is containerized using Docker Compose.

```text
┌──────────────────────────────┐
│       Docker Compose         │
│                              │
│  ┌────────────┐ ┌──────────┐ │
│  │ Frontend   │ │ Backend  │ │
│  │   :5173    │ │  :8000   │ │
│  └────────────┘ └──────────┘ │
│                              │
└──────────────────────────────┘
```

This provides a reproducible development and demonstration environment.

---

# 🏆 Hackathon Context

**Event:** DigiPlus Hackathon
**Problem Domain:** Zepto Customer Support
**Project:** Zepto Support
**Goal:** Build a scalable and intelligent support-ticket management solution for a high-volume quick-commerce environment.

The project focuses on combining:

> **Customer Support + Ticket Management + AI Assistance + Operational Analytics**

into a single platform.

---

# 📜 Disclaimer

This project was developed as a **hackathon prototype** for the DigiPlus Hackathon.

It is not an official Zepto product and is not affiliated with or endorsed by Zepto unless explicitly stated by the organizers.

---

# ⭐ Repository

**GitHub:**
https://github.com/Pushkart1301/zepto-ticket

If you find the project interesting, consider giving the repository a ⭐.

---

## Built for Hackathon 🚀

**Zepto Support — Making customer support faster, smarter and more actionable.**
