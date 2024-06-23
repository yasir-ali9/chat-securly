"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./lib/firebase";
import ChatRoom from "./components/ChatRoom";
import SignIn from "./components/SignIn";
import SignOut from "./components/SignOut";
import styles from "./page.module.css";

export default function Home() {
  const [user] = useAuthState(auth);

  return (
    <div className="app">
      <header>
        <h1>🤍</h1>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}
