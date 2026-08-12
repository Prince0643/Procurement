# Explanation: Purchase Request Preview vs. Downloaded Excel

You noticed that the Purchase Request layout looks different between the web UI preview and the generated Excel file. Here is a detailed breakdown of why these differences occurred.

## 1. Missing "Reviewed by" Signature in the Excel File

**What Happened:**
In the web preview, **Ronalyn Mallare** is correctly displayed under the first "Reviewed by:" box, and **Marjorie Garcia** is displayed in a second row. However, in the Excel file, the first "Reviewed by:" box is completely empty, and only Marjorie Garcia appears on the row below. 

**Why it Happened:**
There is a mismatch between the backend code that generates the Excel file and the structure of the Excel template itself (`PURCHASE REQUEST- FINAL-2026.xlsx`).

- In the backend code (`routes/purchaseRequests.js`), the system tries to place the primary reviewer's name (Ronalyn) into cell **`C34`**.
- However, if you look at how the Excel template is designed, the "Prepared by" box is actually a large merged cell that covers columns A, B, and C (`A33:C34`). 
- Because `C34` is swallowed by the "Prepared by" merged cell, writing Ronalyn's name to it causes the text to be hidden or overwritten by the "Prepared by" name (Elain Torres). 
- The actual "Reviewed by:" box in the template is located in column **D** (`D33:D34`), but the code doesn't write to column D.
- Marjorie Garcia shows up fine because she is treated as an "additional reviewer". The code handles additional reviewers dynamically by adding new rows below the template and merging them correctly.

## 2. "Order No." Overflowing in the Web Preview

**What Happened:**
In the web preview, the text for "Order No." and its number (`299269388`) overlap and overflow past the borders of the table. In the Excel file, it sits perfectly in its designated cell.

**Why it Happened:**
The web preview renders the layout using an HTML `<table>`. HTML tables try to automatically adjust their cell widths based on the content. If the content is too long and the CSS doesn't enforce strict text-wrapping or column widths, the text will simply break out of its container and overflow the border. 
The Excel file, on the other hand, relies on the strict, hardcoded column widths and merged cells defined in the `.xlsx` template file, ensuring the layout remains rigid.

---

### How to Fix It (For Developers)
To make the Excel file match the UI preview, a developer needs to update `routes/purchaseRequests.js` around line 2024 to write the primary reviewer's name to column `D` (e.g., `D34`) instead of `C34`, since column D is where the "Reviewed by" box actually lives in the template.
