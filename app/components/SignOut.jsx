"use client";

import { auth } from "../lib/firebase";

export default function SignOut() {
  return (
    auth.currentUser && (
      <button className="signout-button" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}
