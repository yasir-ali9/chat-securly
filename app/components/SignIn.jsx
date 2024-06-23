"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";
import GoogleLogo from "../../public/google.svg";

export default function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="cont">
      <button className="signin-button" onClick={signInWithGoogle}>
        <Image src={GoogleLogo} alt="Google logo" width={20} height={20} />
        Sign in with Google
      </button>
      <p className="copy-text">
        This app is built by Yasir Ali @All rights reserved!
      </p>
    </div>
  );
}
