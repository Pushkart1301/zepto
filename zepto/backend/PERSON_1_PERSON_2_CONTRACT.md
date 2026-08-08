# PERSON 1 ↔ PERSON 2 CONTRACT
## JSON Schema Lock for Zepto Ticket Resolution

**Status**: ⏳ AWAITING PERSON 1 SIGN-OFF

---

## SECTION 1: Person 1's API Endpoint

**Q1.1: What is your endpoint?**
```
POST /api/ticket/resolve
```

**Q1.2: What status codes do you return?**
```
- 200 OK (success)
- 400 Bad Request (invalid input)
- 422 Unprocessable Entity (validation error)
- 500 Internal Server Error
```

**Q1.3: On error, what do you return?**
```json
{
  "error": "string (error message)",
  "status": "int (HTTP status code)",
  "detail": "optional additional details"
}
```

---

## SECTION 2: Successful Response JSON Schema

Person 2 needs this exact structure:

```json
{
  "ticket": {
    "ticket_id": "N-005",
    "description": "milk packet missing from my order",
    "order_id": "ORD-9905"
  },
  "decision": {
    "status": "AUTO_RESOLVE",
    "confidence": 0.92,
    "action": "redelivery",
    "reason_code": "STRONG_PRECEDENT_AGREEMENT"
  },
  "order": {
    "order_id": "ORD-9905",
    "value_inr": 412.0,
    "delivery_status": "delivered",
    "items": 1,
    "delivery_time_min": 41
  },
  "precedents": [
    {
      "ticket_id": "H-1000",
      "similarity": 0.99,
      "action": "redelivery",
      "resolution_note": "missing item re-sent",
      "csat": 5
    },
    {
      "ticket_id": "H-1007",
      "similarity": 0.99,
      "action": "redelivery",
      "resolution_note": "missing item re-sent",
      "csat": 4
    },
    {
      "ticket_id": "H-1017",
      "similarity": 0.93,
      "action": "partial_refund",
      "resolution_note": "refunded item value",
      "csat": 4
    }
  ]
}
```

**Person 1 Confirmation Checklist:**

- [ ] Ticket section matches your ticket_id/description/order_id
- [ ] Decision status: Always "AUTO_RESOLVE" or "HUMAN_REVIEW"
- [ ] Decision confidence: Always 0.0 to 1.0 (float)
- [ ] Decision action: Can be null when status is "HUMAN_REVIEW"
- [ ] All order fields present (value_inr, delivery_status, items, delivery_time_min)
- [ ] Precedents: 1-3 items (minimum 1, maximum 3)
- [ ] Precedent similarity: 0.0 to 1.0 (float)
- [ ] Precedent csat: Always 3, 4, or 5

---

## SECTION 3: Validation Rules Person 1 MUST Guarantee

**Person 1 Promise:**

- [ ] `decision.status` is always "AUTO_RESOLVE" or "HUMAN_REVIEW"
- [ ] `decision.confidence` is between 0.0 and 1.0
- [ ] `decision.action` is string OR null (never missing)
- [ ] `order.delivery_status` is "delivered" or "cancelled"
- [ ] `order.value_inr` is positive (not negative)
- [ ] `precedents` list has 1-3 items (never empty)
- [ ] `precedent.similarity` is between 0.0 and 1.0
- [ ] `precedent.csat` is 3, 4, or 5
- [ ] All `ticket_id` values are non-empty strings
- [ ] All `description` values are non-empty strings

---

## SECTION 4: Actual Example JSON (REQUIRED)

**Person 1: Provide REAL data from your pipeline here:**

**Example 1 - Strong Precedent (AUTO_RESOLVE):**
```json
{
  "ticket": {
    "ticket_id": "N-005",
    "description": "milk packet missing from my order",
    "order_id": "ORD-9905"
  },
  "decision": {
    "status": "AUTO_RESOLVE",
    "confidence": 0.92,
    "action": "redelivery",
    "reason_code": "STRONG_PRECEDENT_AGREEMENT"
  },
  "order": {
    "order_id": "ORD-9905",
    "value_inr": 412.0,
    "delivery_status": "delivered",
    "items": 1,
    "delivery_time_min": 41
  },
  "precedents": [
    {
      "ticket_id": "H-1000",
      "similarity": 0.99,
      "action": "redelivery",
      "resolution_note": "missing item re-sent",
      "csat": 5
    },
    {
      "ticket_id": "H-1007",
      "similarity": 0.99,
      "action": "redelivery",
      "resolution_note": "missing item re-sent",
      "csat": 4
    }
  ]
}
```

**Example 2 - Low Similarity (HUMAN_REVIEW):**
```json
{
  "ticket": {
    "ticket_id": "N-006",
    "description": "still waiting after 30 min",
    "order_id": "ORD-9906"
  },
  "decision": {
    "status": "HUMAN_REVIEW",
    "confidence": 0.62,
    "action": null,
    "reason_code": "LOW_SIMILARITY"
  },
  "order": {
    "order_id": "ORD-9906",
    "value_inr": 189.0,
    "delivery_status": "delivered",
    "items": 1,
    "delivery_time_min": 35
  },
  "precedents": [
    {
      "ticket_id": "H-100",
      "similarity": 0.68,
      "action": "apology_no_action",
      "resolution_note": "clarified delivery window",
      "csat": 3
    }
  ]
}
```

---

## SECTION 5: Possible Edge Cases

**Case 1: No Similar Tickets Found**
- How many precedents minimum? **1 (Person 2 will handle fewer gracefully)**
- Return dummy/fake precedents? **NO**
- Confidence = 0? **Allowed**

**Case 2: Cancelled Order**
- Auto-resolve if redelivery suggested? **NO - force HUMAN_REVIEW**
- Return reason_code? **"ORDER_CONSTRAINT_VIOLATION"**

**Case 3: Conflicting Actions in Top-3**
- Which action to return? **Majority vote**
- reason_code? **"CONFLICTING_PRECEDENTS"**

**Case 4: API Timeout**
- Return error? **YES - 500 error**
- Person 2 will use fallback response

---

## SECTION 6: Timeline Commitment

**Person 1, when will you complete these?**

| Milestone | Target Hour | Status |
|-----------|-------------|--------|
| CSV loading + parsed | 1 | ⏳ |
| TF-IDF vectorization | 1.5 | ⏳ |
| Top-3 retrieval working | 2 | ⏳ |
| Confidence calculation | 2.5 | ⏳ |
| Decision logic (AUTO vs HUMAN) | 2.5 | ⏳ |
| FastAPI endpoint + returning JSON | 3 | ⏳ |
| PUBLIC URL (frontend can call) | 3.5 | ⏳ |

---

## SECTION 7: Sign-Off

### Person 1 Sign-Off (PENDING)

**I commit to this JSON contract:**

- [ ] By __________ (date/time) I will lock this schema
- [ ] I will not change the schema without notifying Person 2
- [ ] I will test my API returns valid JSON matching this contract
- [ ] I will provide a public URL by Hour __

**Person 1 Name:** ________________  
**Person 1 GitHub:** ________________

---

### Person 2 Sign-Off (YOU - Pushkar)

**I accept this contract and will code against it:**

- [x] By 2026-08-08 I have reviewed this contract
- [x] I will implement Person 2 (ai_service.py) matching this schema
- [x] I will test my code with provided JSON examples
- [x] I will notify Person 1 if I find issues

**Person 2 Name:** Pushkar  
**Person 2 GitHub:** Pushkart1301  
**Signed:** 2026-08-08 ✅

---

## Current Status

**Person 2 (You) - COMPLETE:**
- ✅ `schemas.py` - AIInput, AIOutput, validation
- ✅ `evidence.py` - Evidence packaging
- ✅ `ai_service.py` - LLM integration + fallback
- ✅ `fallback.py` - Deterministic output generation
- ✅ `prompts.py` - LLM prompting
- ✅ Tests passing (5/5)

**Person 1 - PENDING:**
- ⏳ CSV loading
- ⏳ TF-IDF + similarity
- ⏳ Top-3 precedent retrieval
- ⏳ Confidence scoring
- ⏳ FastAPI endpoint
- ⏳ PUBLIC URL

---

## Next Steps

1. **Person 1:** Fill out Sections 1, 4, 5, 6 above
2. **Person 1:** Confirm all checkboxes in Section 3
3. **Person 1:** Sign Section 7
4. **Both:** Commit this to repo
5. **Person 2:** Start building frontend + integration tests
