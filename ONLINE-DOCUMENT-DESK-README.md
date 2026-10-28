# Online Moving Document Desk Update

Added three pages to the Verified Movers & Packers static site:
- `online-documents.html` — document hub
- `online-quotation.html` — editable quotation with charge rows, advance/balance, PDF printing and customer share link
- `online-bill.html` — bill book with multiple C.N. / item rows, charge breakdown, amount-in-words, PDF printing and customer share link

Enhanced `online-bilty.html` with a print-copy selector for Yellow / Consignor, White / Consignee and Pink / Office copies. The selected label appears on the document preview and printout; it does not change the legal status of the document.

The pages reuse the shared theme selector and site shell. Navigation and footer have links to the document desk and each new tool.

## Static-tool limitations
The pages calculate and render in the browser only. They do not save a server-side register, create accounting records, verify tax treatment, or guarantee unique serial numbers across devices. Shareable customer links carry document data in a URL fragment in encoded, not encrypted, form. Avoid including information that should remain confidential and share links only with the intended recipient. For access control, revocation, audit history and multi-user document storage, add a secure backend.
