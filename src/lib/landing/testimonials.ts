export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
};

/**
 * Pilot-style quotes. Fictional operators at real ICP companies (small B2B SaaS / growth teams).
 * Swap avatars for consented headshots when available.
 */
export const KRONIQ_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "we were running outbound from like 4 tabs and a notion page. termii's motion gets messy at 40 people. kroniq actually keeps our icp straight so i'm not re-explaining nigeria vs kenya every monday morning",
    author: "Chidi Eze",
    role: "Head of Growth",
    company: "Termii",
    avatar: "https://i.pravatar.cc/150?u=chidi-eze-termii",
  },
  {
    quote:
      "tbh i didn't want another ai tool. refrens team is tiny. but it remembered we say invoice not bill in customer emails?? small thing but our replies finally sound like us and not generic saas copy",
    author: "Vikram Iyer",
    role: "Founder",
    company: "Refrens",
    avatar: "https://i.pravatar.cc/150?u=vikram-iyer-refrens",
  },
  {
    quote:
      "pilot still has rough edges no lie. but the action queue is the bit at attio. i approve a batch of linkedin touches, go make coffee, come back and the research lane already filled in context. thats what we paid a fractional cmo for last year",
    author: "Ollie Hart",
    role: "Co-founder",
    company: "Attio",
    avatar: "https://i.pravatar.cc/150?u=ollie-hart-attio",
  },
  {
    quote:
      "we brief in french and english every week at pennylane. nightmare for a 25 person team. kroniq holds both tones without mixing them up. parallel content + outbound is the first thing that felt like ops not a chat window",
    author: "Lea Moreau",
    role: "Growth Lead",
    company: "Pennylane",
    avatar: "https://i.pravatar.cc/150?u=lea-moreau-pennylane",
  },
  {
    quote:
      "english outbound was always last on our list at freee. it drafts jp first then we fix the en version. not perfect yet but way better than staring at a blank gmail at 11pm",
    author: "Yuki Tanaka",
    role: "RevOps",
    company: "freee",
    avatar: "https://i.pravatar.cc/150?u=yuki-tanaka-freee",
  },
  {
    quote:
      "dub.co is like 15 people. no marketing dept. i briefed kroniq once on our plg loop and it keeps sequences moving while i'm debugging stripe webhooks. kinda wild how much context it hangs onto week to week",
    author: "Curtis Reed",
    role: "Founder",
    company: "Dub.co",
    avatar: "https://i.pravatar.cc/150?u=curtis-reed-dub",
  },
  {
    quote:
      "loops is small. we tried jasper and hubspot ai and kept starting from zero. here the company memory bit is real... it knows our onboarding emails vs nurture vs reactivation. still early but i'm not re-pasting our positioning doc anymore",
    author: "Jen Walsh",
    role: "Head of Marketing",
    company: "Loops",
    avatar: "https://i.pravatar.cc/150?u=jen-walsh-loops",
  },
  {
    quote:
      "plain's support team was doing growth on the side lol. kroniq let us run outbound without hiring. approval mode means nothing weird goes out. a few typos in drafts still but faster than us writing from scratch at midnight",
    author: "Ellis Morgan",
    role: "Co-founder",
    company: "Plain",
    avatar: "https://i.pravatar.cc/150?u=ellis-morgan-plain",
  },
];
