# Document stamps and records storage

- Added a printable, ink-style digital company seal to the e-Bilty / consignment note, quotation, and bill preview. The seal reads VERIFIED MOVERS & PACKERS · ZIRAKPUR · COMPANY SEAL.
- The seal is a decorative business mark, not a real signature or a government / tax certification.
- Current register storage is zero records / zero MB on the server: this package has no connected records API or database.
- Document forms create an in-browser preview and print/PDF export. Customer links carry Base64url-encoded data in the URL fragment; this is not encryption and the links are not stored, expiring, or revocable by a backend. Avoid confidential information in those links.
- To persist, search, archive, or revoke records centrally, configure a secure server-side API and database first.
