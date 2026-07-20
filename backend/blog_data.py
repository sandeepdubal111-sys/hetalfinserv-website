"""
Blog post metadata — kept in sync with /app/frontend/src/lib/blog.js.
Used by the weekly-digest cron and admin manual-send endpoint.
Only the fields we need for the email digest live here.
If a new post ships in blog.js, add its metadata below (newest first is not required — sorting is by `date`).
"""

BLOG_POSTS = [
    {
        "slug": "5-signals-your-mutual-fund-sends-you",
        "title": "The 5 Signals Your Mutual Fund Sends You — And What They Mean",
        "excerpt": "Your monthly SIP statement quietly whispers five things. Learn to read them like an advisor does, and you'll act with confidence instead of reacting to noise.",
        "category": "investing",
        "date": "2026-06-29",
        "read_minutes": 6,
    },
    {
        "slug": "psychology-of-later-health-insurance",
        "title": "The Psychology of 'Later' — Why Health Insurance Is Always Tomorrow's Decision",
        "excerpt": "Health insurance suffers from a peculiar cognitive bias: it's the most important product you'll never feel motivated to buy today. Here's the fix.",
        "category": "insurance",
        "date": "2026-06-18",
        "read_minutes": 5,
    },
    {
        "slug": "charts-colours-cognitive-traps",
        "title": "Charts, Colours and Cognitive Traps: How Visuals Shape Investor Choices",
        "excerpt": "The same fund can look brilliant on a green line and dreadful on a red one. Great investing means seeing past the visual bias.",
        "category": "behaviour",
        "date": "2026-05-30",
        "read_minutes": 5,
    },
    {
        "slug": "creator-economy-wealth-builds-slow",
        "title": "The Creator Economy Pays Fast, Wealth Builds Slow",
        "excerpt": "A viral month can look like financial freedom, but real wealth still comes from the boring machinery of SIPs, term cover, and compounding.",
        "category": "planning",
        "date": "2026-05-19",
        "read_minutes": 5,
    },
    {
        "slug": "five-quotes-great-investors-think",
        "title": "Five Quotes That Reveal How Great Investors Actually Think",
        "excerpt": "Buffett, Bogle, Marks, Munger and a quiet Indian voice — five lines that will steady your hand across the next decade.",
        "category": "behaviour",
        "date": "2026-04-17",
        "read_minutes": 5,
    },
    {
        "slug": "corrections-dont-break-portfolios",
        "title": "Corrections Don't Break Portfolios — Reactions Do",
        "excerpt": "Every 15-20% correction is remembered as a crisis and analysed later as an opportunity. The gap between the two is behaviour.",
        "category": "behaviour",
        "date": "2026-03-24",
        "read_minutes": 4,
    },
    {
        "slug": "sip-laziness-pays-off",
        "title": "SIP Is the Only Place Where Laziness Pays Off",
        "excerpt": "Automate the boring parts. Ignore the news. Review once a year. That's the entire secret — and it works because most people won't do it.",
        "category": "investing",
        "date": "2026-03-06",
        "read_minutes": 4,
    },
    {
        "slug": "gen-z-emotionally-intelligent-investors",
        "title": "Why Gen Z Might Become the Most Emotionally Intelligent Investors Yet",
        "excerpt": "Digitally native, therapy-fluent and community-driven — the next generation of investors will beat us on behaviour, not spreadsheets.",
        "category": "planning",
        "date": "2026-02-13",
        "read_minutes": 5,
    },
]


def latest_post() -> dict:
    """Return the newest blog post by date."""
    return max(BLOG_POSTS, key=lambda p: p["date"])


def get_post(slug: str) -> dict | None:
    return next((p for p in BLOG_POSTS if p["slug"] == slug), None)
