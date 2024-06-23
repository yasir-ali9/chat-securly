"use client";

import { useRef, useState, useEffect } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { auth, firestore } from "../lib/firebase";
import { generateRSAKeys, rsaEncrypt } from "../lib/rsaUtils";
import ChatMessage from "./ChatMessage";

export default function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const usersRef = collection(firestore, "users");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));

  const [messages] = useCollectionData(q, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const [keys, setKeys] = useState(null);

  useEffect(() => {
    const fetchOrGenerateKeys = async () => {
      const { uid } = auth.currentUser;
      const userDoc = doc(usersRef, uid);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists() && userSnap.data().privateKey) {
        // If keys exist, use them
        setKeys({
          publicKey: userSnap.data().publicKey,
          privateKey: userSnap.data().privateKey,
        });
      } else {
        // If keys don't exist, generate new ones
        const newKeys = generateRSAKeys();
        setKeys(newKeys);

        // Store both public and private keys
        await setDoc(userDoc, {
          uid,
          publicKey: newKeys.publicKey,
          privateKey: newKeys.privateKey,
        });
      }
    };

    fetchOrGenerateKeys();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    if (keys) {
      // Fetch all users' public keys
      const usersSnapshot = await getDocs(usersRef);
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Encrypt the message for each user
      const encryptedMessages = users.map((user) => ({
        uid: user.uid,
        text: rsaEncrypt(formValue, user.publicKey),
      }));

      const timestamp = serverTimestamp();

      await addDoc(messagesRef, {
        encryptedTexts: encryptedMessages,
        createdAt: timestamp,
        uid,
        photoURL,
      });
    }

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              privateKey={keys?.privateKey}
            />
          ))}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Message here..."
        />
        <button className="send-button" type="submit" disabled={!formValue}>
          ➜
        </button>
      </form>
    </>
  );
}