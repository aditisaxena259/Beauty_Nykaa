# 💄 AI-Powered Beauty Assistant

An end-to-end intelligent product recommendation system built for beauty retail. This system integrates **Neo4j Knowledge Graphs**, **LLM-powered chatbots**, **inventory-aware recommendations**, **contextual follow-up questions**, and **product comparison capabilities** to create a personalized, conversational shopping experience.

---

## 🚀 Overview

This project simulates a real-world digital assistant for platforms like **Nykaa**, focusing on helping users find the right products with minimal effort. It supports:

- 💬 LLM-powered query understanding
- 🧠 Knowledge Graph-based product retrieval
- 🏪 Inventory checks for availability
- 🔁 Alternative suggestions
- ⚖️ Intelligent product comparisons
- 📈 Follow-up question generation for user preference refinement

---

## 🧱 Architecture

User Query → Query Classifier → Category & Feature Extractor
↓ ↘
Chatbot UI → Neo4j Knowledge Graph ← Inventory Checker
↘
Follow-up Question Generator
↘
Final Recommendation Output

---

## 🧠 Knowledge Graph

We constructed a domain-specific **knowledge graph using Neo4j** from a real-world dataset (13k+ products, 150+ attributes). Key features:

- Nodes for **Products**, **Brands**, **Categories**, **Shades**, **Benefits**, etc.
- Edges representing relationships such as `HAS_BENEFIT`, `BELONGS_TO`, `HAS_COLOR`, etc.
- Enables complex queries like:
  - _"Find all waterproof eyeliners under ₹500 from Maybelline"_
  - _"Suggest alternatives with same finish but in red shade"_

---

## 🤖 Chatbot with LLMs

A conversational assistant using **Amazon Bedrock (LLaMA 3)** + fine-tuned prompt logic:

- Classifies queries: `product_search`, `inventory_check`, `comparison`, `alternatives`, etc.
- Auto-generates contextual questions:
  - _"What finish are you looking for in a lip gloss?"_
  - _"Do you prefer long-lasting or quick-dry options?"_
- Generates personalized responses using retrieved graph data

---

## 🛒 Inventory Check Module

Before final recommendation:

- Runs an **inventory availability check** on products
- If the item is out of stock:
  - Offers **similar in-stock alternatives**
  - Adds a subtle **upselling nudge** based on brand/benefit affinity

---

## 🔁 Follow-Up Question Generator

To reduce choice overload, we generate up to **4 follow-up questions** per category based on:

- Top extracted product attributes (e.g., color, finish, benefit, composition)
- Real-time pruning based on answered questions
- Allows **user-driven narrowing down** before showing products

Example:
> _"What color are you looking for in your eyeliner?"_  
> _"Would you prefer a glossy or matte finish?"_

---

## ⚖️ Product Comparison Logic

Users can compare two or more products using:

- Attribute-level breakdown: price, brand, finish, color, benefits
- Highlights differences and similarities
- Suggests **better-rated or better-priced** options

---

## 📚 Tech Stack

| Layer       | Tool/Framework |
|-------------|----------------|
| Backend     | FastAPI        |
| LLM Layer   | Amazon Bedrock (LLaMA 3) |
| Database    | Neo4j (Knowledge Graph) |
| Frontend    | React + TailwindCSS |
| Deployment  | Docker, Ngrok for tunneling |
| NLP         | spaCy, Transformers |
| Scripting   | Python (Pandas) |

---

## 🌟 Highlights

- ✅ Built scalable product graphs from noisy e-commerce metadata
- ✅ Integrated **graph search + LLM** in real-time
- ✅ Enabled dynamic follow-up generation and UX
- ✅ Mimics real Nykaa salesperson flow via chatbot logic
- ✅ Structured for **multi-category** and **multi-feature** expansion

---

## 📦 Future Enhancements

- Add **sentiment-based tuning** for responses
- Implement **user memory / preference persistence**
- Add **voice assistant integration**
- Build dashboard for real-time analytics on queries & conversions





---


