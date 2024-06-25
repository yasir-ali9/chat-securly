// app/components/ChatRoom.jsx

import { useRef, useState, useEffect, useCallback } from "react";
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
  updateDoc,
} from "firebase/firestore";
import { auth, firestore } from "../lib/firebase";
import { getOrGenerateRSAKeys, rsaEncrypt } from "../lib/rsa";
import ChatMessage from "./ChatMessage";

export default function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));

  const [messages] = useCollectionData(q, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const [keys, setKeys] = useState(null);
  const [registrationTimestamp, setRegistrationTimestamp] = useState(null);

  const fetchOrGenerateKeys = useCallback(async () => {
    const usersRef = collection(firestore, "users");
    const { uid } = auth.currentUser;
    const userDoc = doc(usersRef, uid);
    const userSnap = await getDoc(userDoc);

    let { publicKey, privateKey, registrationTimestamp } =
      getOrGenerateRSAKeys(uid);

    if (!userSnap.exists()) {
      // User is new
      await setDoc(userDoc, {
        uid,
        publicKey,
        registrationTimestamp,
      });
    } else {
      // User exists, update their public key and registration timestamp
      await updateDoc(userDoc, {
        publicKey,
        registrationTimestamp,
      });
    }

    setKeys({ publicKey, privateKey });
    setRegistrationTimestamp(registrationTimestamp);
  }, []);

  useEffect(() => {
    fetchOrGenerateKeys();
  }, [fetchOrGenerateKeys]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    if (keys) {
      const usersRef = collection(firestore, "users");
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
      <main className="main">
        <div className="msg">
          The messages are end-to-end encrypted using RSA algorithm.
        </div>

        {messages &&
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              privateKey={keys?.privateKey}
              registrationTimestamp={registrationTimestamp}
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
