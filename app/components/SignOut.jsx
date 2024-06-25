// app/components/SignOut.jsx
import { auth } from "../lib/firebase";
import { clearAllUserData } from "../lib/rsa";

export default function SignOut() {
  const handleSignOut = () => {
    const userId = auth.currentUser.uid;
    clearAllUserData(userId);
    auth.signOut();
  };

  return (
    auth.currentUser && (
      <button className="signout-button" onClick={handleSignOut}>
        Sign Out
      </button>
    )
  );
}
