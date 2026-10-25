# Mehedi Hasan

Personal site: markets, policy, politics and geopolitics, written from Dhaka.

Built with Next.js and Supabase, hosted on Vercel.

- Write and publish at `/studio`.
- Every push to the `main` branch deploys the site.

## Design

The site is set as a research notebook. Its parts come from open source projects:

- Typeface: ET Book, cut for Edward Tufte's books ([edwardtufte/et-book](https://github.com/edwardtufte/et-book), MIT licence). The files are in `app/fonts`.
- Margin notes: footnotes written as `[^1]` appear in the right margin on wide screens, following [Tufte CSS](https://github.com/edwardtufte/tufte-css).
- Article grid with a margin column for key figures and contents, after the [Distill template](https://github.com/distillpub/template).
- Interface and figures: IBM Plex Sans.

The first key number of a post (Studio, Key numbers) is its headline figure in every list, so put the most telling one first.
