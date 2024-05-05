---
title: "Deloitte Virtual Risk Analysis Project"
date: 2023-09-02T13:19:27+01:00
draft: false
featuredImage: "/images/deloitte.jpg"
categories: 
- reflection
tags:
- business analysis
---
Enrolling in Forge's Virtual Program was driven by my passion to delve deep into the intricacies of data analysis, especially within the context of real-world applications. 
The program provided a platform to not only refine my analytical skills but also understand the tangible impact data-driven insights can have on businesses. 

Throughout this journey, I acquired a holistic perspective on data processing, from sourcing and cleaning data to deriving actionable insights and visualizing them in a manner that's both comprehensible and actionable for stakeholders.

In the following sections, I'll walk you through the detailed process I employed to analyze the case. 
The aim was to identify the most "risky" components, grounding the analysis on a calculated 'Risk Score'. 

# Analysis Process Explanation

In the task of identifying the most "risky" components within the technology architecture of LogisticAI, 
a precise metric was essential for a comprehensive understanding. 

I adopted the "Risk Score" for this purpose, which leveraged both the 'Average Severity Score' and the 'Count of Downtimes'. The methodology I adopted is detailed as follows:

## Risk Score Calculation:

- This was deduced by multiplying the 'Average Severity Score' by the 'Count of Downtimes'.
- Compared with the sample answer, this approach showcased a more nuanced understanding of risk as it took into account both the frequency and the gravity of each downtime.

## Ranking Components by Risk:

- The data was sorted in descending order based on the 'Risk Score' to rank the components from the highest to the lowest risk.
- From this sorted dataset, the top three components with the highest risk scores were extracted.

## Pie Chart Visualization:
![](/images/evidence_slide.png)

- The pie chart was plotted with the 'Risk Score' of each component.
- The percentages of the top three components were calculated by taking their individual risk scores and dividing them by the total risk score, and then multiplying by 100.

## Insight Extraction:
![](/images/summary_slide.png)

- To draw meaningful insights, the role and significance of each component within LogisticAI's operations were considered in the context of their associated risk.
- This allowed for a deeper understanding of not just the magnitude of risk but also its potential implications for the organization.

---

By adhering to this structured process, I was able to derive data-driven insights on the components that pose the greatest risks to LogisticAI's operations.
