import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProviderSignUp = () => {
  return (
    <div>
      <h1>Provider Sign Up</h1>
      <Button>Sign Up as Provider</Button>
      <Link to="/signup">Sign Up as Client</Link>
    </div>
  );
};

export default ProviderSignUp;
