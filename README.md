This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## RSVP storage

The RSVP modal sends its responses to this project's `/api/rsvp` Next.js route. The route validates the data and appends one row to a private Google Sheet. Guests see confirmation only after Google reports that one row was added. A failed or uncertain save leaves the form filled so it can be retried; a retry may produce a duplicate row if Google's first write succeeded but its response was lost. Repeated attempts keep the same `submission_id` until the guest edits the response, which helps identify duplicates.

To connect a Sheet:

1. Create a spreadsheet and a dedicated tab (for example, `RSVP`). Put these headings in cells A1:K1, in order: `submission_id`, `submitted_at_utc`, `name`, `side`, `relationship`, `attending`, `additional_guests`, `total_attendees`, `drinks_alcohol`, `message`, `schema_version`. Keep this tab as a contiguous response table; put summaries in another tab. If connecting an existing populated tab, inspect and align its columns before using it.
2. Enable the Google Sheets API for a Google Cloud project. Create a dedicated service account and share only the intended spreadsheet with its email address as **Editor**. Do not make the spreadsheet public. The Sheets API is called with the `spreadsheets` OAuth scope.
3. Copy `.env.example` to `.env.local` and set the spreadsheet ID from its URL, exact tab name, service-account email, and private key. Store the private key as a server secret in production. For single-line environment values, encode its line breaks as `\n`; the route converts them back. Never prefix these values with `NEXT_PUBLIC_` or commit `.env.local`.
4. Set `RSVP_ALLOWED_ORIGIN` to the public site's exact `https://...` origin on the host. Deploy with a Next.js server runtime; static export cannot run this route. Apply distributed request limits at the hosting edge before launch. The included process-local limit of five requests per IP and 30 total per minute is only a basic guard and does not coordinate across server instances. Configure proxy IP headers so clients cannot spoof the address used for that local guard.
5. Use a separate test spreadsheet first. Submit one attending and one declining response, and verify row order, guest totals, Thai text, and a relationship beginning with `=`. The API uses `RAW` input so Google stores text as text. Then switch the server secrets to the production spreadsheet. Keep access to the raw response tab restricted to organizers.

`additional_guests` excludes the respondent; blank means zero. `total_attendees` is zero for a decline and one plus additional guests for an acceptance. A declining response stores zero additional guests and `false` for alcohol. `submitted_at_utc` is a server-generated ISO timestamp. The route does not update or delete earlier RSVPs.

Run `npm run test:rsvp` for the RSVP validation and Sheets adapter tests. Those tests use a mock Google response and do not write to a real spreadsheet. A live smoke test requires the configured sheet and credentials.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
