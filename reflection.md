# Half-Page Reflection: Agent Debugging & Prompt Iteration

**Project**: Real-Time Salon Queue Management System  
**Topic**: One Thing the AI Agent Got Wrong, How It Was Noticed, and How the Prompt/Documentation Was Fixed  

---

### 1. What the Agent Got Wrong
When integrating the customer queue submission flow (`JoinQueuePage.jsx`) with the centralized business logic engine (`queueService.js`), the AI agent converted `joinQueue()` into an asynchronous function (`async function joinQueue`) so it could persist new tokens to Supabase in the background. However, inside the React form submission handler (`handleSubmit`), the agent invoked `joinQueue()` synchronously without an `await` statement:

```javascript
// What the agent wrote:
const entry = joinQueue({ name, phone, serviceIds, barberId });
navigate(`/status/${entry.token}`); // entry is a pending Promise!
```

Because the asynchronous call was never awaited, `entry` evaluated to a pending JavaScript `Promise` rather than the returned queue object. Accessing `entry.token` immediately evaluated to `undefined`. As a consequence, the router redirected the user to the literal route `/status/undefined`, causing the status tracking view to crash with a *"Token Not Found: We could not find active spot undefined"* error.

---

### 2. How I Noticed It
During end-to-end user acceptance testing on the live Vercel production deployment (`https://202612018-vibe-coding.vercel.app/join`):
1. I completed the remote join form with a valid 10-digit mobile number, selected haircut services, and chose a stylist.
2. Upon tapping **"Confirm & Join Queue"**, instead of seeing the expected live ticket countdown (`/status/S-XX`), I was confronted with a warning screen displaying **"Token Not Found"**.
3. By inspecting the browser address bar and developer console, I immediately noticed that the URL was `/status/undefined`. Even though the database environment variables had already been supplied to Vercel, the client routing was receiving `undefined` for the token parameter.

---

### 3. How I Fixed My Prompt and Documentation
Rather than vaguely asking the agent to "fix joining", I refined my prompt with exact behavioral and visual feedback:
- **Targeted Prompting**: I supplied the exact runtime error and reproduction screenshot:  
  > *"On Vercel it is showing this error when joining the queue. I have added the environment variable still same error."* (accompanied by the `/status/undefined` screenshot).
- **Enforcing Async Invariants**: I directed the agent to trace the execution chain from form submission to token generation. This prompted the agent to:
  1. Make `handleSubmit` an `async` function and properly await `const entry = await joinQueue(...)`.
  2. Add defensive validation (`if (entry && entry.token)`) before executing `navigate()`.
  3. Update `MyStatusPage.jsx` with defensive fallback logic (`(id && id !== 'undefined') ? id : getActiveUserTokenId()`) to prevent broken routes from corrupting local user sessions.
- **Specification Rule Alignment**: In `docs/03-flows-rules.md`, I ensured the queue transition state machine explicitly defines that token generation must resolve synchronously or be strictly awaited prior to triggering client-side navigation.

---

### Key Takeaway
AI coding agents excel at modularizing code, but often overlook async/sync boundary mismatches when connecting UI handlers to cloud persistence layers. Precise prompt engineering—supplying exact browser routes, runtime state (`undefined`), and screenshot context—is essential to guiding the agent to the root cause without introducing secondary bugs.
