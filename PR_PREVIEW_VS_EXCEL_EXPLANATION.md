# Explanation: Purchase Request Preview vs. Downloaded Excel

You noticed that the Purchase Request layout looks different between the web UI preview and the generated Excel file. Here is a detailed breakdown of why these differences occurred.

## 1. Missing "Reviewed by" Signature in the Excel File

**What Happened First (Fixed):**
Initially, the first "Reviewed by" signature was completely missing. This was because the code was writing it to cell `C34`, which is hidden inside the large "Prepared by" merged cell (`A33:C34`). You correctly fixed this by moving it to `D34`.

**What Happened Next (Ronalyn Mallare is Missing):**
After fixing the first reviewer, you noticed that in the second row of reviewers, **Ronalyn Mallare** (the first additional reviewer) is missing, and **Admin Charisse** (the second additional reviewer) took her place in the first box of that row.

**Why it Happened:**
This is due to a mismatch between how the code assumes the 3 signature boxes are laid out, and how the Excel template actually designed them.

- The code has a loop that places up to 3 reviewers per row. It calculates their column positions like this:
  - Reviewer 1 (Ronalyn) -> Column A
  - Reviewer 2 (Charisse) -> Column C
  - Reviewer 3 -> Column E
- However, the Excel template is structured differently. The first signature box on each row is a massive merged cell covering columns **A, B, and C**. The second box is just column **D**, and the third box is columns **E and F**.
- Because the first box covers A, B, and C, when the code writes Ronalyn to Column **A**, she is placed in the first box. But then it immediately writes Charisse to Column **C**, which is *still part of the first box*! 
- As a result, Charisse's name overwrites Ronalyn's name in the exact same box, making Ronalyn disappear.

## 2. "Order No." Overflowing in the Web Preview

**What Happened:**
In the web preview, the text for "Order No." and its number (`299269388`) overlap and overflow past the borders of the table. In the Excel file, it sits perfectly in its designated cell.

**Why it Happened:**
The web preview renders the layout using an HTML `<table>`. HTML tables try to automatically adjust their cell widths based on the content. If the content is too long and the CSS doesn't enforce strict text-wrapping or column widths, the text will simply break out of its container and overflow the border. 
The Excel file, on the other hand, relies on the strict, hardcoded column widths and merged cells defined in the `.xlsx` template file, ensuring the layout remains rigid.

---

### How to Fix It (For Developers)
To fix the disappearing reviewers and the unwanted cell merging, you need to update the column mapping and merging logic for additional reviewers in `routes/purchaseRequests.js` (around line 2061). 

Instead of mathematically calculating `startCol = (i * 2) + 1` and blindly adding `1` for the `endCol`, hardcode the starting and ending columns to match the template's layout. We also need to add an `if` condition so that we only run `mergeCells` when the cell actually needs to be merged (Column D is a single cell, so `startCol` and `endCol` are both 4).

Replace this block of code:
```javascript
            // Assuming this is your current code:
            const columns = [1, 4, 5]; // Column A (1), Column D (4), Column E (5)
            const startCol = columns[i];
            const endCol = startCol + 1;  // 2 (B), 5 (E), 6 (F)
            const colLetter1 = String.fromCharCode(64 + startCol);
            const colLetter2 = String.fromCharCode(64 + endCol);

            try {
              worksheet.mergeCells(`${colLetter1}${currentRow}:${colLetter2}${currentRow}`);
              worksheet.mergeCells(`${colLetter1}${currentRow + 1}:${colLetter2}${currentRow + 1}`);
              worksheet.mergeCells(`${colLetter1}${currentRow + 2}:${colLetter2}${currentRow + 2}`);
            } catch (e) {
              // Ignore merge errors if already merged
            }
```

With this fully corrected block:
```javascript
            const columns = [1, 4, 5]; // Column A (1), Column D (4), Column E (5)
            const endCols = [3, 4, 6]; // Column C (3), Column D (4), Column F (6)
            const startCol = columns[i];
            const endCol = endCols[i];
            const colLetter1 = String.fromCharCode(64 + startCol);
            const colLetter2 = String.fromCharCode(64 + endCol);

            // Only run the merge logic if the cell actually spans multiple columns
            if (startCol !== endCol) {
              try {
                worksheet.mergeCells(`${colLetter1}${currentRow}:${colLetter2}${currentRow}`);
                worksheet.mergeCells(`${colLetter1}${currentRow + 1}:${colLetter2}${currentRow + 1}`);
                worksheet.mergeCells(`${colLetter1}${currentRow + 2}:${colLetter2}${currentRow + 2}`);
              } catch (e) {
                // Ignore merge errors if already merged
              }
            }
```
This ensures Reviewer 1 goes to A:C, Reviewer 2 stays exactly in D without merging into E, and Reviewer 3 goes to E:F.
