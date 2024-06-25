// app/components/ChatMessage.jsx
import { useState } from "react";
import { auth } from "../lib/firebase";
import { rsaDecrypt } from "../lib/rsa";
import Image from "next/image";
export default function ChatMessage(props) {
  const { encryptedTexts, uid, photoURL, createdAt } = props.message;
  const { privateKey, registrationTimestamp } = props;
  const [text, setText] = useState("Encrypted message... ");
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  const handleToggleCrypto = () => {
    if (createdAt.toMillis() < registrationTimestamp) {
      setShowPopup(true);
      return;
    }

    if (privateKey && encryptedTexts) {
      const myEncryptedText = encryptedTexts.find(
        (et) => et.uid === auth.currentUser.uid
      );
      if (myEncryptedText) {
        if (isDecrypted) {
          setText("Encrypted message... ");
        } else {
          try {
            const decrypted = rsaDecrypt(myEncryptedText.text, privateKey);
            setText(decrypted);
          } catch (error) {
            console.error("Decryption failed:", error);
            setShowPopup(true);
            return;
          }
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
      {showPopup && (
        <div className="popup">
          You can't decrypt this message because you are new to chat, or may be
          re-signed in.
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
}
