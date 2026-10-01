# Challenges I Faced During This Assignment

When I started building this portfolio dashboard, I thought it would be straightforward - just read an Excel file, fetch some stock prices, and display them in a table. But as I got into it, I realized there were quite a few challenges that needed to be handled. Here's my honest account of what I ran into and how I dealt with each one.

---

## Challenge 1: The Excel File Wasn't as Simple as It Looked

**What Happened:**
When I first opened the Excel file, I expected a clean table with stock data. Instead, I found this complex structure with sector headers mixed in with actual stock rows. The first 14 columns were empty, and the actual headers started at column 14. The sector rows didn't have serial numbers, while stock rows did. It was messy.

**How I Solved It:**
I had to write a custom parser that could distinguish between sector rows (which had "Sector" in the name and no serial number) and actual stock rows (which had serial numbers and real data). I also had to skip all those empty columns at the beginning. It took some trial and error to get the row detection logic right.

**Lesson Learned:**
Never assume real-world data is clean. Always build your parser to handle edge cases and weird formatting.

---

## Challenge 2: Mixed Symbol Formats Were a Headache

**What Happened:**
The Excel file had stock symbols in two different formats. Some were text like "HDFCBANK" or "BAJFINANCE" (these are NSE symbols), but others were just numbers like "532174" or "544252" (these are BSE codes). When I tried to use these with external APIs, they didn't work because the APIs expect specific formats like "HDFCBANK.NS" for NSE or "532174.BO" for BSE.

**How I Solved It:**
I created a symbol mapping layer. For the text symbols, I just added ".NS" to make them NSE format. For the numeric BSE codes, I had to manually map them to their NSE equivalents where possible (like 532174 → ICICIBANK.NS). For stocks that only trade on BSE, I added ".BO" to the numeric code. This wasn't perfect, but it worked for most stocks.

**Lesson Learned:**
Data normalization is crucial. You can't just use raw data from Excel - you need to transform it to match what your external systems expect.

---

## Challenge 3: Yahoo Finance Doesn't Have an Official API

**What Happened:**
This was a big one. The assignment said to use Yahoo Finance for market data, but when I looked into it, I discovered that Yahoo Finance doesn't provide an official public API. They have an unofficial API that people use, but it could break at any time if Yahoo changes their system. This made me nervous about using it in a production scenario.

**How I Solved It:**
I decided to use the `yahoo-finance2` Node.js package, which is a popular unofficial library. But I made sure to:
1. Document this limitation clearly in the README
2. Implement caching so we don't hit the API too often
3. Add fallback to mock data if the API fails
4. Design the code so the data provider can be swapped out easily later

For a real production app, I'd recommend using a paid API like Alpha Vantage or Finnhub that has official support.

**Lesson Learned:**
Always verify that external APIs are officially supported before committing to them. Have a backup plan.

---

## Challenge 4: Google Finance Was Even Worse

**What Happened:**
The assignment mentioned using Google Finance for P/E ratio and earnings data. But Google Finance has even less API support than Yahoo. There's basically no reliable way to get data from Google Finance programmatically without scraping their website, which is fragile and might violate their terms of service.

**How I Solved It:**
I realized that Yahoo Finance actually provides P/E ratio and earnings data through the same library I was using for market prices. So I just used Yahoo Finance for both. It's not exactly what the assignment asked for, but it's more reliable and cleaner than trying to scrape Google Finance.

**Lesson Learned:**
Sometimes the best solution is to use a single source of truth rather than trying to integrate multiple unreliable sources.

---

## Challenge 5: Handling Partial API Failures

**What Happened:**
When I first tried fetching market data for all 29 stocks, if even one stock failed, the entire request would fail. This was frustrating because maybe 28 stocks worked fine, but one had an invalid symbol, and the user would see nothing.

**How I Solved It:**
I switched from using `Promise.all` to `Promise.allSettled`. This change was crucial. `Promise.all` fails fast if any request fails, but `Promise.allSettled` waits for all requests to complete and returns both successes and failures separately. Now if 1 stock fails, I can still show data for the other 28 stocks and just mark the failed one as "N/A".

**Lesson Learned:**
Don't let one failure ruin the whole experience. Handle partial failures gracefully.

---

## Challenge 6: Rate Limiting Was a Real Concern

**What Happened:**
The assignment required refreshing every 15 seconds. I was worried that hitting external APIs this frequently would trigger rate limits, especially since some APIs have strict limits on free tiers.

**How I Solved It:**
I implemented server-side caching with different TTLs:
- Market data: 60 seconds cache
- Fundamental data: 300 seconds cache

This means the frontend refreshes every 15 seconds, but the backend only calls the external API once every 60 seconds (for market data). The other 3 requests in that minute just return cached data. This reduced external API calls by 75% while still giving the user a sense of real-time updates.

**Lesson Learned:**
Caching is your friend when dealing with rate-limited APIs. It improves performance and reduces the risk of hitting limits.

---

## Challenge 7: Making the Dashboard Actually Look Good

**What Happened:**
I'm not a designer, and my initial attempt at the UI looked pretty basic - just a plain HTML table. It didn't look like a professional financial dashboard at all.

**How I Solved It:**
I used Tailwind CSS to build a more polished interface:
- Added summary cards at the top showing key metrics
- Created expandable sector sections
- Added color coding (green for gains, red for losses)
- Included charts using Recharts for visual appeal
- Made it responsive so it works on mobile

It's not going to win any design awards, but it looks professional enough for a financial dashboard.

**Lesson Learned:**
Invest time in the UI. Even if the backend is perfect, users will judge the application by how it looks.

---

## Challenge 8: Deciding Between Multiple API Endpoints vs One

**What Happened:**
I initially thought about creating three separate API endpoints:
- `/api/portfolio` for static data
- `/api/market-data` for current prices
- `/api/fundamentals` for P/E and earnings

But this meant the frontend would need to make three separate requests and manage three different loading states.

**How I Solved It:**
I decided to combine everything into a single endpoint: `/api/portfolio/live`. This endpoint returns the static portfolio data combined with the dynamic market and fundamental data all in one response. This simplified the frontend significantly - just one request, one loading state, and all data is consistent because it comes from the same timestamp.

**Lesson Learned:**
Sometimes combining data on the backend is better than making the frontend do the work. It reduces complexity and ensures consistency.

---

## Challenge 9: Dealing with Missing Data

**What Happened:**
Some stocks in the Excel file had "#N/A" for P/E ratio or earnings. Others had invalid symbols that couldn't be resolved. I needed to handle these cases without crashing the application.

**How I Solved It:**
I made the dynamic fields optional in TypeScript (using `?`) and added checks throughout the code:
- If CMP is missing, show "N/A" in the table
- If P/E is missing, show "N/A"
- If all market data fails, show a warning but keep the static data visible
- Never show fake or made-up data

**Lesson Learned:**
Design for failure. Assume things will go wrong and build your system to handle it gracefully.

---

## Challenge 10: Choosing the Right Architecture

**What Happened:**
I had to decide whether to use a separate Node.js backend or just use Next.js API routes. I also had to decide on state management (Context vs Redux vs Zustand).

**How I Solved It:**
For the backend, I chose Next.js API routes because:
- No need for a separate server to manage
- Built-in TypeScript support
- Easy deployment with Vercel
- Sufficient for this use case

For state management, I chose React Context because:
- Built into React, no extra library
- Simple enough for this use case (not complex state)
- Easier to explain in interviews than Redux

**Lesson Learned:**
Choose the simplest solution that meets your needs. Don't over-engineer.

---

## Challenge 11: Making It Interview-Ready

**What Happened:**
The whole point of this assignment was to be able to explain it in an interview. I needed to make sure every decision could be justified and the code was clean enough to walk through.

**How I Solved It:**
I:
- Used TypeScript throughout for type safety
- Separated calculations into pure functions (easy to test and explain)
- Created a clear service layer architecture
- Wrote comprehensive documentation
- Created an interview Q&A document covering common questions
- Made sure variable names and function names were descriptive

**Lesson Learned:**
Write code as if you'll have to explain it to someone else. Because you probably will.

---

## Challenge 12: The "It Works on My Machine" Problem

**What Happened:**
When I first ran the dev server, it worked, but I got warnings about the Excel file being outside the Git repository. I also had to make sure the environment variables were set up correctly.

**How I Solved It:**
I:
- Created a `.env.local` file for environment variables
- Updated `.gitignore` to allow committing `.env.example` but not `.env.local`
- Wrote clear setup instructions
- Created an initialization script to convert Excel to JSON

**Lesson Learned:**
Make your project easy for someone else to set up. If it's a pain to get running, people won't bother.

---

## Overall Reflection

Building this dashboard was more challenging than I initially thought, but that's probably true of most real-world projects. The biggest lessons for me were:

1. **Data is messy**: Real-world data never comes in a clean format. You need robust parsing and normalization.

2. **External APIs are unreliable**: They go down, have rate limits, and sometimes don't even have official APIs. Always have fallbacks.

3. **Error handling is crucial**: Things will fail. Your application should handle failures gracefully instead of crashing.

4. **Simplicity wins**: Don't over-engineer. Use the simplest solution that meets your needs.

5. **Documentation matters**: You'll forget why you made certain decisions. Write it down.

6. **Make it interview-ready**: Write clean code with good naming because you'll have to explain it.

I'm pretty happy with how it turned out. It's not perfect - the Yahoo Finance API limitation is a real concern for production - but it demonstrates solid engineering practices and could easily be extended or modified for a real production environment.

---

## What I Would Do Differently Next Time

If I were to do this again, I would:
1. Start with a production-ready API (like Alpha Vantage) instead of Yahoo Finance
2. Add unit tests for the calculation functions
3. Implement proper error logging
4. Add a database for persistent storage instead of just JSON files
5. Spend more time on the UI/UX design

But overall, this was a great learning experience and I feel confident I could explain every part of it in an interview.
