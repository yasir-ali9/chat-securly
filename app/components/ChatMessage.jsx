"use client";

import { useState } from "react";
import { auth } from "../lib/firebase";
import { rsaDecrypt } from "../lib/rsaUtils";
import Image from "next/image";

export default function ChatMessage(props) {
  const { encryptedTexts, uid, photoURL, createdAt } = props.message;
  const { privateKey } = props;
  const [text, setText] = useState("Encrypted message... ");
  const [isDecrypted, setIsDecrypted] = useState(false);

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const handleToggleCrypto = () => {
    if (privateKey && encryptedTexts) {
      const myEncryptedText = encryptedTexts.find(
        (et) => et.uid === auth.currentUser.uid
      );
      if (myEncryptedText) {
        if (isDecrypted) {
          setText("Encrypted message... ");
        } else {
          const decrypted = rsaDecrypt(myEncryptedText.text, privateKey);
          setText(decrypted);
        }
        setIsDecrypted(!isDecrypted);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`message ${messageClass}`}>
      <Image
        src={
          photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
        }
        alt="User avatar"
        width={40}
        height={40}
      />
      <div className="message-content">
        <p>
          <div>
            {text}
            <button className="encdec-button" onClick={handleToggleCrypto}>
              {isDecrypted ? "Encrypt" : "Decrypt"}
            </button>
          </div>

          <span className="timestamp">{formatTimestamp(createdAt)}</span>
        </p>
      </div>
    </div>
  );
}
