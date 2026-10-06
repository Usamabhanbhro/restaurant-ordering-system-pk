# Legal Review Notes — QueueLess Privacy & Data Compliance (Pakistan)

> **Status: Research only — not legal advice.** This document records research findings from an October 2026 search pass and lists questions for a Pakistani lawyer to review. It does not state legal conclusions or obligations. A qualified legal practitioner must still review the product and these notes before launch.

## 1. Research Findings

### 1.1 Status of Data Protection Legislation
- As of the sources reviewed in mid-2026, **no comprehensive data-protection statute is enacted** in Pakistan.
- Successive drafts of the **Personal Data Protection Bill** were prepared by the Ministry of IT in 2018, 2020, 2021, 2023, and a 2025 version. The 2025 version has not been enacted into law as of the source date.
- One source referenced a 2026 parliamentary mention of a finalised bill, but this does not establish enactment.
- **Action required:** status must be re-checked against the Senate Acts register and the official Pakistan Gazette before relying on any assumption about current law.

**Sources reviewed:**
- offlist.me (Pakistan data protection review, August 2026)
- recordinglaw.com (Pakistan data privacy guide, 2026)
- Chambers Data Protection & Privacy 2026 (Pakistan chapter)
- DLA Piper Data Protection (Pakistan overview)
- Commoner Law guide (2026)
- LexBlog and Aaj News (draft bill coverage)

### 1.2 Current Criminal Law Touching Personal Data
- **PECA 2016 (Prevention of Electronic Crimes Act), as amended in January 2025**, remains the main current legal instrument touching personal data and electronic systems.
- PECA is described as a **criminal statute**, not a comprehensive privacy framework.
- Relevant offences described in sources include:
  - unauthorised access to information systems
  - unauthorised copying or transmission of data
  - unauthorised disclosure of personal data
- One source reports that the January 2025 amendment moved enforcement responsibilities to the **National Cyber Crime Investigation Agency (NCCIA)**.
- Sources also indicate there are currently **no statutory data-subject rights** (such as access, correction, or deletion rights) under PECA.

### 1.3 Draft Bills as a Design Benchmark Only
The following principles have appeared in past draft bills. They are **not presented as current legal obligations**, but may inform defensive product design:
- consent and purpose-limitation concepts
- appointment of a data protection officer for "significant" controllers
- breach notification proposals (the 2020 draft proposed a 72-hour window)
- local-processing requirements for "critical" personal data
- conditions on cross-border data transfer

## 2. Questions for Counsel

1. What is the current enacted status of the Personal Data Protection Bill or Act, and whether any sector-specific rules apply to a restaurant-ordering platform?
2. Does PECA 2016 require consent or a specific notice for the data categories collected by QueueLess, and what counts as unauthorised disclosure when venue staff view customer data?
3. Is QueueLess a controller, a processor, or both in relation to each venue, and what contract should sit between the platform and a venue?
4. How does cross-border data transfer apply where the chosen cloud hosting region or the email provider is outside Pakistan?
5. Does displaying a venue’s bank or wallet details and recording that the venue confirmed a payment create any State Bank of Pakistan or payment-service obligations? (**Not researched.**)
6. Are the no-show, no-refund, and cancellation terms acceptable under applicable consumer-protection law? (**Not researched.**)
7. What retention periods should apply per data category, and what process is needed to handle account deletion requests?
8. What notice is required for browser storage and a random device ID?
9. Whether any customers may be minors, and what implications that has.
10. What breach-response duties and contacts apply if a security incident occurs.

## 3. Items Still Unresolved

- Exact retention periods per data category (per-venue setting is TBD).
- Choice of cloud hosting region and email provider.
- Whether any of the above triggers additional sectoral or cross-border compliance requirements.
