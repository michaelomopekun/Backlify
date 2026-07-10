"use client";

import { useState, useEffect } from "react";
import { joinWaitlist, getWaitlistCount } from "@/app/actions/waitlist.actions";

export function WaitlistForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getWaitlistCount().then(setCount);
  }, []);

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setMessage("");

    const result = await joinWaitlist(formData);

    if (result.error) {
      setStatus("error");
      setMessage(result.error);
    } else {
      setStatus("success");
      setMessage("You're on the list! We'll be in touch soon.");
    }
  }

  if (status === "success") {
    return (
      <div className="waitlist-form" style={{ textAlign: "center" }}>
        <h3 style={{ fontFamily: "var(--font-sans), monospace", fontSize: "1.5rem", color: "var(--foreground)", marginBottom: "0.5rem" }}>
          Success! 🎉
        </h3>
        <p style={{ fontFamily: "var(--font-serif), serif", color: "var(--muted)", fontSize: "1.1rem" }}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <form className="waitlist-form" action={handleSubmit}>
      <input 
        type="email" 
        name="email"
        placeholder="Enter your email" 
        className="waitlist-input" 
        required 
        disabled={status === "loading"}
      />
      <button 
        type="submit" 
        className="waitlist-submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Joining..." : "Join"}
      </button>
      {status === "error" && (
        <p style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: "-0.5rem" }}>
          {message}
        </p>
      )}
      <p className="waitlist-stat" style={{ marginTop: "1rem" }}>
        <span className="waitlist-stat-bold">{count !== null ? count : "0"}</span> people already joined
      </p>
    </form>
  );
}
